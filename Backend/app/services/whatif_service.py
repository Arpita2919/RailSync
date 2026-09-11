"""RailSync 2.0 — What-if disruption service.

NEVER modifies the current plan. Clones planning state, injects disruption,
re-optimizes, and diffs against the current plan.
"""

from __future__ import annotations

import time
import uuid
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.db import repositories as repo
from app.integrations import layer3
from app.schemas.optimization import (
    AssignmentOut,
    PlanDiff,
    WhatIfRequest,
    WhatIfResponse,
)
from app.services import risk_service, task_service
from railsync.layer0.generator import generate_timetable

log = get_logger("service.whatif")


def run_whatif(db: Session, request: WhatIfRequest) -> WhatIfResponse:
    """Run a what-if disruption simulation without modifying the current plan."""
    whatif_start = time.perf_counter()
    run_id = f"WIF-{uuid.uuid4().hex[:8].upper()}"
    log.info("What-if started run_id=%s type=%s segment=%s severity=%s",
             run_id, request.type, request.segment_id, request.severity)

    # Get current plan for comparison
    current_plan = repo.get_current_plan(db)
    current_assignments = []
    if current_plan:
        current_assignments = repo.get_assignments_for_plan(db, current_plan.plan_id)

    # Build task pool (clone of current pending tasks + injected disruption task)
    tasks = task_service.get_pending_tasks(db)
    risk_data = risk_service.get_risk_data_map(db)

    # Inject the disruption as a new high-priority task
    disruption_task = _create_disruption_task(request)
    repo.upsert_task(db, **{
        "task_id": disruption_task["task_id"],
        "segment_id": disruption_task["segment_id"],
        "department": disruption_task["department"],
        "task_type": disruption_task["task_type"],
        "claimed_criticality": disruption_task["claimed_criticality"],
        "min_duration_hrs": disruption_task["min_duration_hrs"],
        "preferred_window_start": disruption_task.get("preferred_window_start"),
        "preferred_window_end": disruption_task.get("preferred_window_end"),
        "overdue": disruption_task.get("overdue", True),
        "status": "disruption",
    })
    tasks.append(disruption_task)

    # Boost risk for the affected segment
    modified_risk = dict(risk_data)
    if request.segment_id in modified_risk:
        boosted = dict(modified_risk[request.segment_id])
        severity_mult = {"low": 1.2, "moderate": 1.5, "critical": 1.8, "emergency": 2.0}
        mult = severity_mult.get(request.severity, 1.5)
        boosted["risk_30d"] = min(boosted.get("risk_30d", 0.5) * mult, 0.99)
        modified_risk[request.segment_id] = boosted

    # Run negotiation + optimization (Layer 2 → Layer 3)
    from app.integrations import layer2
    neg_result = layer2.negotiate(tasks, modified_risk)
    scored_tasks = neg_result["scored_tasks"]

    timetable = generate_timetable(seed=42)
    policy = current_plan.policy if current_plan else "balanced"

    opt_result = layer3.optimize(
        tasks=scored_tasks,
        risk_data=modified_risk,
        timetable=timetable,
        policy=policy,
        horizon_days=7,
    )

    elapsed_ms = int((time.perf_counter() - whatif_start) * 1000)

    if not opt_result["feasible"]:
        log.warning("What-if infeasible run_id=%s", run_id)
        return WhatIfResponse(
            feasible=False,
            run_id=run_id,
            reason=[opt_result.get("error_message", "Infeasible under disruption scenario")],
            execution_time_ms=elapsed_ms,
        )

    # Persist as what-if plan (NOT current)
    repo.save_optimization_run(db, **{
        "run_id": opt_result["run_id"],
        "policy": policy,
        "horizon": "weekly",
        "status": opt_result["status"],
        "execution_time_ms": opt_result["execution_time_ms"],
        "objective_values": opt_result.get("objective_values"),
        "robustness_score": opt_result.get("robustness_score"),
        "input_summary": {"what_if": True, "disruption": request.model_dump()},
        "output_summary": {"assignments": len(opt_result["assignments"])},
    })

    plan_id = f"PLAN-WIF-{uuid.uuid4().hex[:8].upper()}"
    repo.save_block_plan(db, **{
        "plan_id": plan_id,
        "optimization_run_id": opt_result["run_id"],
        "plan_type": "what_if",
        "policy": policy,
        "status": "simulated",
        "is_current": False,  # NEVER set what-if as current
    })

    for a in opt_result["assignments"]:
        repo.save_assignment(db, **{
            "plan_id": plan_id,
            "task_id": a["task_id"],
            "segment_id": a["segment_id"],
            "department": a["department"],
            "block_start": a["block_start"],
            "block_end": a["block_end"],
            "duration_hrs": a["duration_hrs"],
            "priority": a.get("priority"),
            "risk_30d": a.get("risk_30d"),
            "reason": a.get("reason"),
            "explanation": a.get("explanation"),
            "consolidation_group": a.get("consolidation_group"),
        })

    db.commit()

    # Diff engine
    plan_b_assignments = opt_result["assignments"]
    diffs, added, removed, reasons = _diff_plans(current_assignments, plan_b_assignments, request)

    log.info("What-if complete run_id=%s plan_b=%s changes=%d elapsed=%dms",
             run_id, plan_id, len(diffs), elapsed_ms)

    return WhatIfResponse(
        feasible=True,
        run_id=run_id,
        plan_b={"plan_id": plan_id, "policy": policy, "assignments": len(plan_b_assignments)},
        changed_assignments=diffs,
        added_assignments=[AssignmentOut(**a) for a in added],
        removed_assignments=[AssignmentOut(**a) for a in removed],
        reason=reasons,
        execution_time_ms=elapsed_ms,
        objective_values=opt_result.get("objective_values"),
    )


def _create_disruption_task(request: WhatIfRequest) -> dict[str, Any]:
    """Create a synthetic high-priority task from a disruption event."""
    parse_hour = 8
    if request.time:
        try:
            parts = request.time.split(":")
            parse_hour = int(parts[0])
        except (ValueError, IndexError):
            pass

    severity_to_crit = {"low": 3, "moderate": 4, "critical": 5, "emergency": 5}
    crit = severity_to_crit.get(request.severity, 4)

    base = datetime(2026, 9, 15, parse_hour, 0, 0)
    return {
        "task_id": f"DISRUPTION-{uuid.uuid4().hex[:6].upper()}",
        "segment_id": request.segment_id,
        "department": "TRACK",
        "task_type": request.type,
        "claimed_criticality": crit,
        "min_duration_hrs": 2.0 if request.severity != "critical" else 3.0,
        "overdue": True,
        "preferred_window_start": base,
        "preferred_window_end": base + timedelta(hours=6),
        "weighted_priority": float(crit) + 1.0,  # disruptions get priority boost
    }


def _diff_plans(
    current_assignments: list,
    plan_b_assignments: list[dict],
    request: WhatIfRequest,
) -> tuple[list[PlanDiff], list[dict], list[dict], list[str]]:
    """Compare current plan assignments with Plan B."""
    current_map = {}
    for a in current_assignments:
        current_map[a.task_id] = a

    plan_b_map = {}
    for a in plan_b_assignments:
        plan_b_map[a["task_id"]] = a

    diffs = []
    added = []
    removed = []
    reasons = []

    # Detect moved/modified assignments
    for task_id, new_a in plan_b_map.items():
        if task_id in current_map:
            old_a = current_map[task_id]
            if old_a.block_start != new_a["block_start"] or old_a.block_end != new_a["block_end"]:
                diffs.append(PlanDiff(
                    task_id=task_id,
                    change_type="moved",
                    old_start=old_a.block_start,
                    old_end=old_a.block_end,
                    new_start=new_a["block_start"],
                    new_end=new_a["block_end"],
                    reason=f"Task {task_id} moved due to {request.type} disruption on {request.segment_id}",
                ))
                reasons.append(
                    f"Task {task_id} moved from "
                    f"{old_a.block_start.strftime('%H:%M')}–{old_a.block_end.strftime('%H:%M')} to "
                    f"{new_a['block_start'].strftime('%H:%M')}–{new_a['block_end'].strftime('%H:%M')} "
                    f"because the injected {request.severity} {request.type} required the earlier window."
                )
        else:
            added.append(new_a)
            if task_id.startswith("DISRUPTION"):
                reasons.append(f"New emergency task {task_id} added for {request.type} on {request.segment_id}")

    # Detect removed assignments
    for task_id, old_a in current_map.items():
        if task_id not in plan_b_map:
            removed.append({
                "task_id": old_a.task_id,
                "segment_id": old_a.segment_id,
                "department": old_a.department,
                "block_start": old_a.block_start,
                "block_end": old_a.block_end,
                "duration_hrs": old_a.duration_hrs,
                "priority": old_a.priority,
                "risk_30d": old_a.risk_30d,
            })
            reasons.append(f"Task {task_id} deferred to accommodate emergency disruption")

    if not reasons:
        reasons.append("Plan B is identical to current plan — disruption has no scheduling impact")

    return diffs, added, removed, reasons
