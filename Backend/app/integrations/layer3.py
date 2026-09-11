"""RailSync 2.0 — Layer 3 Integration Adapter: CP-SAT Optimization.

Bridge between backend services and the production Optimization engine.
Converts service-layer dicts ↔ Optimization engine dataclasses while
preserving the exact interface that optimization_service.py and
whatif_service.py depend on.
"""

from __future__ import annotations

import time
import uuid
from datetime import datetime, timedelta
from typing import Any

from app.core.logging import get_logger

# Import the production Optimization engine
from Optimization import (
    MaintenanceTask,
    BlockWindow,
    OptimizationResult,
    OptimizerConfig,
    RailSyncOptimizer,
)

log = get_logger("layer3")

# Policy string → OptimizerConfig factory
_POLICY_CONFIG_MAP = {
    "safety_first": OptimizerConfig.safety_first,
    "balanced": OptimizerConfig.balanced,
    "throughput_first": OptimizerConfig.throughput_first,
}

# Time discretization for converting timetable → BlockWindows
SLOT_MINUTES = 15
DAILY_SLOTS = 24 * 60 // SLOT_MINUTES  # 96 slots per day


# ──────────────────────────────────────────────────────────────
# Internal helpers: convert service-layer dicts → engine objects
# ──────────────────────────────────────────────────────────────

def _tasks_to_dataclasses(
    tasks: list[dict[str, Any]],
    risk_data: dict[str, dict[str, Any]],
    horizon_days: int,
) -> list[MaintenanceTask]:
    """Convert scored task dicts into MaintenanceTask dataclass objects."""
    result = []
    horizon_label = "WEEKLY" if horizon_days <= 7 else "MONTHLY"
    for task in tasks:
        seg_id = task.get("segment_id", "")
        risk = risk_data.get(seg_id, {})
        risk_30d = risk.get("risk_30d", 0.0)

        # Map numeric criticality (1-5) to string labels
        crit_raw = task.get("claimed_criticality", 3)
        if isinstance(crit_raw, (int, float)):
            crit_map = {5: "CRITICAL", 4: "HIGH", 3: "MEDIUM", 2: "LOW", 1: "LOW"}
            crit_str = crit_map.get(int(crit_raw), "MEDIUM")
        else:
            crit_str = str(crit_raw).upper()

        result.append(MaintenanceTask(
            task_id=str(task.get("task_id", "")),
            segment=seg_id,
            claimed_criticality=crit_str,
            min_duration_hrs=float(task.get("min_duration_hrs", 1.0)),
            risk_30d=float(risk_30d),
            preferred_window=task.get("preferred_window"),
            description=task.get("description", task.get("task_type", "")),
            day_index=0,
            horizon=horizon_label,
        ))
    return result


def _generate_block_windows(
    timetable: list[dict[str, Any]],
    base_date: datetime,
    horizon_days: int,
) -> list[BlockWindow]:
    """Generate BlockWindow objects from the timetable and planning horizon.

    Creates daily maintenance windows (night 00:00–06:00 and midday 10:00–16:00)
    for each day of the planning horizon, marking passenger train conflicts
    from the provided timetable.
    """
    horizon_label = "WEEKLY" if horizon_days <= 7 else "MONTHLY"
    blocks: list[BlockWindow] = []
    window_index = 0

    for day in range(horizon_days):
        day_base = base_date + timedelta(days=day)

        # Night window: 00:00 – 06:00 (6 hours)
        night_start = day_base
        night_end = day_base + timedelta(hours=6)

        # Midday window: 10:00 – 16:00 (6 hours)
        mid_start = day_base + timedelta(hours=10)
        mid_end = day_base + timedelta(hours=16)

        for label, w_start, w_end in [
            ("NIGHT", night_start, night_end),
            ("MIDDAY", mid_start, mid_end),
        ]:
            # Determine passenger conflicts by checking timetable overlaps
            passenger_conflicts: dict[str, int] = {}
            freight_conflicts: dict[str, int] = {}

            for entry in timetable:
                train_start = entry.get("start", w_end)
                train_end = entry.get("end", w_start)
                # Check overlap: train [train_start, train_end] vs window [w_start, w_end]
                if train_start < w_end and train_end > w_start:
                    seg = entry.get("segment_id", entry.get("section", ""))
                    train_type = entry.get("type", "passenger").lower()
                    if train_type == "passenger":
                        passenger_conflicts[seg] = passenger_conflicts.get(seg, 0) + 1
                    else:
                        freight_conflicts[seg] = freight_conflicts.get(seg, 0) + 1

            block_id = f"BLK-D{day:02d}-{label}-{window_index:03d}"
            duration_hrs = (w_end - w_start).total_seconds() / 3600.0

            blocks.append(BlockWindow(
                block_id=block_id,
                start_time=w_start.strftime("%Y-%m-%d %H:%M"),
                end_time=w_end.strftime("%Y-%m-%d %H:%M"),
                duration_hrs=duration_hrs,
                window_index=window_index,
                passenger_conflicts=passenger_conflicts,
                freight_conflicts=freight_conflicts,
                allowed_segments=None,
                day_index=day,
                horizon=horizon_label,
            ))
            window_index += 1

    return blocks


def _result_to_dict(
    result: OptimizationResult,
    run_id: str,
    policy: str,
    horizon_days: int,
    elapsed_ms: int,
    base_date: datetime,
    risk_data: dict[str, dict[str, Any]],
    tasks: list[dict[str, Any]],
) -> dict[str, Any]:
    """Convert OptimizationResult dataclass → service-layer dict format.

    Maintains exact interface compatibility with optimization_service.py
    and whatif_service.py.
    """
    status_name = result.solver_status.lower()
    feasible = status_name in ("optimal", "feasible")

    if not feasible:
        return {
            "run_id": run_id,
            "policy": policy,
            "horizon_days": horizon_days,
            "status": status_name,
            "feasible": False,
            "assignments": [],
            "objective_values": {},
            "robustness_score": None,
            "execution_time_ms": elapsed_ms,
            "error_message": f"Solver returned {status_name}",
            "affected_tasks": [t.task_id for t in result.scheduled_tasks],
            "solver_status": status_name,
        }

    # Build lookup for scored task data (for explanations)
    task_lookup = {str(t.get("task_id", "")): t for t in tasks}

    # Convert scheduled tasks → assignment dicts
    assignments = []
    for st in result.scheduled_tasks:
        if st.status != "SCHEDULED" or not st.assigned_block:
            continue

        task_data = task_lookup.get(st.task_id, {})
        seg_risk = risk_data.get(st.segment, {})

        # Parse block window times from the assigned block
        block_start, block_end = _parse_block_times(
            st.assigned_block, base_date, st.duration_hrs
        )

        explanation = _build_explanation(task_data, seg_risk)

        assignments.append({
            "task_id": st.task_id,
            "segment_id": st.segment,
            "department": task_data.get("department", ""),
            "block_start": block_start,
            "block_end": block_end,
            "duration_hrs": round(st.duration_hrs, 2),
            "priority": task_data.get("weighted_priority"),
            "risk_30d": st.risk_30d,
            "reason": explanation["primary_reason"],
            "explanation": explanation,
            "consolidation_group": task_data.get("consolidation_group"),
            "constraint_summary": {
                "timetable_conflicts_avoided": result.total_freight_trains_delayed,
                "maintenance_window": "00:00-06:00, 10:00-16:00",
            },
        })

    assignments.sort(key=lambda a: a["block_start"])

    # Objective values in the format services expect
    scheduled_count = result.scheduled_tasks_count
    total_count = result.total_tasks
    objective_values = {
        "safety_score": round(
            sum(a.get("risk_30d", 0) for a in assignments) / max(total_count, 1), 4
        ),
        "throughput_score": round(scheduled_count / max(total_count, 1), 4),
        "total_scheduled": scheduled_count,
        "total_tasks": total_count,
        "solver_objective": round(result.objective_value, 2),
    }

    # Robustness estimation
    robustness = round(scheduled_count / max(total_count, 1) * 0.85 + 0.1, 3)

    return {
        "run_id": run_id,
        "policy": policy,
        "horizon_days": horizon_days,
        "status": status_name,
        "feasible": True,
        "assignments": assignments,
        "objective_values": objective_values,
        "robustness_score": robustness,
        "execution_time_ms": elapsed_ms,
        "error_message": None,
        "affected_tasks": [],
        "solver_status": status_name,
    }


def _parse_block_times(
    block_id: str,
    base_date: datetime,
    duration_hrs: float,
) -> tuple[datetime, datetime]:
    """Extract start/end datetimes from a BLK-D{day}-{label}-{idx} block ID."""
    try:
        parts = block_id.split("-")
        day_idx = int(parts[1].replace("D", ""))
        label = parts[2]  # NIGHT or MIDDAY
        day_base = base_date + timedelta(days=day_idx)
        if label == "NIGHT":
            start = day_base  # 00:00
        else:
            start = day_base + timedelta(hours=10)  # 10:00
        end = start + timedelta(hours=duration_hrs)
        return start, end
    except (IndexError, ValueError):
        # Fallback: use base_date + offset
        start = base_date
        end = start + timedelta(hours=duration_hrs)
        return start, end


def _build_explanation(task: dict[str, Any], risk: dict[str, Any]) -> dict[str, Any]:
    """Build WHY explanation from actual task and risk data."""
    risk_30d = risk.get("risk_30d", 0.0)
    crit = task.get("claimed_criticality", 1)
    priority = task.get("weighted_priority", 0.0)
    overdue = task.get("overdue", False)

    factors = []
    if risk_30d > 0:
        factors.append({"name": "risk_30d", "value": risk_30d, "contribution": round(risk_30d * 0.5, 3)})
    if isinstance(crit, (int, float)):
        factors.append({"name": "criticality", "value": crit, "contribution": round(crit / 5.0 * 0.3, 3)})
    else:
        factors.append({"name": "criticality", "value": crit, "contribution": 0.15})
    if overdue:
        factors.append({"name": "overdue", "value": 1, "contribution": 0.2})

    # Primary reason based on dominant factor
    if risk_30d >= 0.7:
        primary = "High-risk segment prioritized for safety within feasible block window."
    elif overdue:
        primary = "Overdue maintenance scheduled to prevent further deterioration."
    elif isinstance(priority, (int, float)) and priority >= 3.0:
        primary = "High-priority task scheduled based on evidence-weighted scoring."
    else:
        primary = "Routine maintenance allocated to available block window."

    constraints = ["timetable conflict avoidance", "maintenance window compliance"]
    if task.get("min_duration_hrs", 0) > 2:
        constraints.append("minimum block duration requirement")

    consolidation = None
    if task.get("consolidation_group"):
        consolidation = f"Combined with compatible tasks in group {task['consolidation_group']}"

    return {
        "primary_reason": primary,
        "factors": factors,
        "constraints": constraints,
        "consolidation_benefit": consolidation,
    }


# ──────────────────────────────────────────────────────────────
# Public API — preserved interface for downstream services
# ──────────────────────────────────────────────────────────────

def optimize(
    tasks: list[dict[str, Any]],
    risk_data: dict[str, dict[str, Any]],
    timetable: list[dict[str, Any]],
    policy: str = "balanced",
    horizon_days: int = 7,
    base_date: datetime | None = None,
    time_limit_seconds: float = 10.0,
) -> dict[str, Any]:
    """Run CP-SAT block plan optimization via the production Optimization engine.

    Interface is 100% backward-compatible with the previous prototype.
    Downstream services (optimization_service, whatif_service) require no changes.

    Args:
        tasks: scored task pool (from Layer 2) with weighted_priority, min_duration_hrs, etc.
        risk_data: segment_id → risk prediction
        timetable: train passage windows to avoid
        policy: safety_first | balanced | throughput_first
        horizon_days: planning horizon in days
        base_date: start of planning window
        time_limit_seconds: solver time limit

    Returns:
        Normalized optimization result dict.
    """
    run_id = f"OPT-{datetime.now().strftime('%Y-%m')}-{uuid.uuid4().hex[:6].upper()}"
    log.info(
        "Layer 3 optimization started run_id=%s policy=%s tasks=%d horizon=%dd",
        run_id, policy, len(tasks), horizon_days,
    )

    if base_date is None:
        base_date = datetime(2026, 9, 15, 0, 0, 0)

    start_time = time.perf_counter()

    if not tasks:
        elapsed = int((time.perf_counter() - start_time) * 1000)
        return _empty_result(run_id, policy, horizon_days, elapsed, "No tasks to schedule")

    # ── Step 1: Convert dicts → engine dataclasses ──
    engine_tasks = _tasks_to_dataclasses(tasks, risk_data, horizon_days)
    engine_blocks = _generate_block_windows(timetable, base_date, horizon_days)

    if not engine_blocks:
        elapsed = int((time.perf_counter() - start_time) * 1000)
        return _empty_result(run_id, policy, horizon_days, elapsed, "No block windows generated")

    # ── Step 2: Select config by policy ──
    config_factory = _POLICY_CONFIG_MAP.get(policy, OptimizerConfig.balanced)
    config = config_factory()
    config.SOLVER_TIMEOUT_SECONDS = time_limit_seconds

    # ── Step 3: Run the production CP-SAT engine ──
    optimizer = RailSyncOptimizer(config=config)
    result: OptimizationResult = optimizer.optimize(
        tasks=engine_tasks,
        blocks=engine_blocks,
    )

    elapsed_ms = int((time.perf_counter() - start_time) * 1000)

    log.info(
        "Layer 3 optimization finished run_id=%s status=%s scheduled=%d/%d elapsed=%dms",
        run_id, result.solver_status, result.scheduled_tasks_count,
        result.total_tasks, elapsed_ms,
    )

    # ── Step 4: Convert result → service-layer dict ──
    return _result_to_dict(
        result=result,
        run_id=run_id,
        policy=policy,
        horizon_days=horizon_days,
        elapsed_ms=elapsed_ms,
        base_date=base_date,
        risk_data=risk_data,
        tasks=tasks,
    )


def _empty_result(
    run_id: str, policy: str, horizon_days: int, elapsed_ms: int, msg: str
) -> dict[str, Any]:
    return {
        "run_id": run_id,
        "policy": policy,
        "horizon_days": horizon_days,
        "status": "optimal",
        "feasible": True,
        "assignments": [],
        "objective_values": {"safety_score": 0, "throughput_score": 0, "total_scheduled": 0, "total_tasks": 0},
        "robustness_score": 1.0,
        "execution_time_ms": elapsed_ms,
        "error_message": msg,
        "affected_tasks": [],
        "solver_status": "optimal",
    }


def is_available() -> bool:
    """Check if the Optimization engine and OR-Tools are available."""
    try:
        from ortools.sat.python import cp_model
        _ = cp_model.CpModel()
        _ = RailSyncOptimizer()
        return True
    except Exception:
        return False
