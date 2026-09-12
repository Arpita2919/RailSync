"""RailSync 2.0 — Data access repositories (thin CRUD layer with real Supabase synchronization)."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.db import supabase_client
from app.db.models import (
    BlockAssignment,
    BlockPlan,
    FeedbackRecord,
    MaintenanceTask,
    NegotiationResult,
    OptimizationRun,
    RiskPrediction,
    Segment,
)

log = get_logger("repositories")


# ── Segments ──────────────────────────────────────────────────

def get_segment(db: Session, segment_id: str) -> Optional[Segment]:
    seg = db.query(Segment).filter(Segment.segment_id == segment_id).first()
    if not seg:
        # Check if segments need initial fetch
        get_all_segments(db)
        seg = db.query(Segment).filter(Segment.segment_id == segment_id).first()
    return seg


def get_all_segments(db: Session) -> list[Segment]:
    segs = db.query(Segment).order_by(Segment.segment_id).all()
    if not segs:
        # Transparently pull real segments from Supabase
        remote_segs = supabase_client.get_remote_segments()
        if remote_segs:
            for s in remote_segs:
                seg_dict = {
                    "segment_id": s["segment_id"],
                    "division": s.get("division", "Delhi"),
                    "section": s.get("section"),
                    "asset_type": s.get("asset_type", "Track"),
                    "length_km": float(s.get("length_km", 10.0)),
                    "age_years": float(s.get("age_years", 20.0)),
                    "installation_year": s.get("installation_year"),
                    "curve_gradient_class": s.get("curve_gradient_class", "flat"),
                    "monsoon_exposure": s.get("monsoon_exposure", "low"),
                    "freight_density_class": s.get("freight_density_class", "medium"),
                    "corridor": s.get("corridor", "NDLS-CNB"),
                }
                upsert_segment(db, **seg_dict)
            try:
                db.commit()
            except Exception:
                db.rollback()
            segs = db.query(Segment).order_by(Segment.segment_id).all()
            log.info("Synced %d real segments from Supabase into active database", len(segs))
    return segs


def upsert_segment(db: Session, **kwargs) -> Segment:
    existing = db.query(Segment).filter(Segment.segment_id == kwargs["segment_id"]).first()
    if existing:
        for k, v in kwargs.items():
            setattr(existing, k, v)
        db.flush()
        return existing
    seg = Segment(**kwargs)
    db.add(seg)
    db.flush()
    return seg


# ── Maintenance Tasks ─────────────────────────────────────────

def get_task(db: Session, task_id: str) -> Optional[MaintenanceTask]:
    return db.query(MaintenanceTask).filter(MaintenanceTask.task_id == task_id).first()


def _ensure_tasks_synced(db: Session):
    count = db.query(func.count(MaintenanceTask.id)).scalar()
    if count == 0:
        get_all_segments(db)  # Ensure segments exist first for FK integrity
        remote_tasks = supabase_client.get_remote_tasks()
        if remote_tasks:
            for t in remote_tasks:
                start_dt = None
                end_dt = None
                if t.get("preferred_window_start"):
                    try:
                        start_dt = datetime.fromisoformat(str(t["preferred_window_start"]).replace("Z", "+00:00"))
                    except Exception:
                        pass
                if t.get("preferred_window_end"):
                    try:
                        end_dt = datetime.fromisoformat(str(t["preferred_window_end"]).replace("Z", "+00:00"))
                    except Exception:
                        pass

                task_dict = {
                    "task_id": t["task_id"],
                    "segment_id": t["segment_id"],
                    "department": t.get("department", "TRACK"),
                    "task_type": t.get("task_type", "Routine Inspection"),
                    "claimed_criticality": int(t.get("claimed_criticality", 3)),
                    "min_duration_hrs": float(t.get("min_duration_hrs", 2.0)),
                    "overdue": bool(t.get("overdue", False)),
                    "preferred_window_start": start_dt,
                    "preferred_window_end": end_dt,
                    "status": t.get("status", "pending"),
                }
                upsert_task(db, **task_dict)
            try:
                db.commit()
            except Exception:
                db.rollback()
            log.info("Synced %d real tasks from Supabase into active database", len(remote_tasks))


def get_tasks_by_status(db: Session, status: str) -> list[MaintenanceTask]:
    _ensure_tasks_synced(db)
    return db.query(MaintenanceTask).filter(MaintenanceTask.status == status).all()


def get_all_tasks(db: Session) -> list[MaintenanceTask]:
    _ensure_tasks_synced(db)
    return db.query(MaintenanceTask).order_by(MaintenanceTask.created_at.desc()).all()


def upsert_task(db: Session, **kwargs) -> tuple[MaintenanceTask, bool]:
    """Returns (task, created). If task_id exists, updates it.
    
    Auto-creates a minimal segment record if the referenced segment_id does
    not yet exist in the database, preventing FK constraint failures when
    emergency/disruption tasks reference optimizer-internal segment IDs.
    """
    existing = get_task(db, kwargs["task_id"])
    if existing:
        for k, v in kwargs.items():
            setattr(existing, k, v)
        db.flush()
        return existing, False
    # Ensure the segment exists before inserting the task (FK guard)
    seg_id = kwargs.get("segment_id")
    if seg_id:
        seg_exists = db.query(Segment).filter(Segment.segment_id == seg_id).first()
        if not seg_exists:
            # Create a minimal placeholder segment so the FK is satisfied
            placeholder = Segment(
                segment_id=seg_id,
                division="Unknown",
                asset_type="TRACK",
                length_km=10.0,
                age_years=10.0,
                curve_gradient_class="flat",
                monsoon_exposure="low",
                freight_density_class="medium",
            )
            db.add(placeholder)
            db.flush()
    task = MaintenanceTask(**kwargs)
    db.add(task)
    db.flush()
    return task, True


# ── Risk Predictions ──────────────────────────────────────────

def get_latest_risk(db: Session, segment_id: str) -> Optional[RiskPrediction]:
    return (
        db.query(RiskPrediction)
        .filter(RiskPrediction.segment_id == segment_id)
        .order_by(desc(RiskPrediction.prediction_timestamp))
        .first()
    )


def get_all_latest_risks(db: Session) -> list[RiskPrediction]:
    """Latest risk prediction per segment via a subquery."""
    subq = (
        db.query(
            RiskPrediction.segment_id,
            func.max(RiskPrediction.prediction_timestamp).label("max_ts"),
        )
        .group_by(RiskPrediction.segment_id)
        .subquery()
    )
    return (
        db.query(RiskPrediction)
        .join(
            subq,
            (RiskPrediction.segment_id == subq.c.segment_id)
            & (RiskPrediction.prediction_timestamp == subq.c.max_ts),
        )
        .all()
    )


def save_risk_prediction(db: Session, **kwargs) -> RiskPrediction:
    pred = RiskPrediction(**kwargs)
    db.add(pred)
    db.flush()
    return pred


# ── Negotiation Results ───────────────────────────────────────

def save_negotiation_result(db: Session, **kwargs) -> NegotiationResult:
    res = NegotiationResult(**kwargs)
    db.add(res)
    db.flush()
    return res


def get_negotiation_results_by_run(db: Session, run_id: str) -> list[NegotiationResult]:
    return (
        db.query(NegotiationResult)
        .filter(NegotiationResult.negotiation_run_id == run_id)
        .all()
    )


# ── Optimization Runs ─────────────────────────────────────────

def save_optimization_run(db: Session, **kwargs) -> OptimizationRun:
    run = OptimizationRun(**kwargs)
    db.add(run)
    db.flush()
    return run


def get_optimization_run(db: Session, run_id: str) -> Optional[OptimizationRun]:
    return (
        db.query(OptimizationRun)
        .filter(OptimizationRun.run_id == run_id)
        .first()
    )


# ── Block Plans & Assignments ─────────────────────────────────

def save_block_plan(db: Session, **kwargs) -> BlockPlan:
    plan = BlockPlan(**kwargs)
    db.add(plan)
    db.flush()
    return plan


def get_current_active_plan(db: Session) -> Optional[BlockPlan]:
    plan = (
        db.query(BlockPlan)
        .filter(BlockPlan.is_current == True)  # noqa: E712
        .order_by(desc(BlockPlan.created_at))
        .first()
    )
    if not plan:
        plan = db.query(BlockPlan).order_by(desc(BlockPlan.created_at)).first()

    if not plan:
        # Attempt to pull plans from Supabase. Each step is isolated so that
        # any failure does not corrupt the caller's open transaction.
        try:
            remote_plans = supabase_client.get_remote_plans(limit=2)
        except Exception:
            remote_plans = []

        if remote_plans:
            try:
                get_all_segments(db)
                _ensure_tasks_synced(db)
            except Exception:
                pass

            for rp in remote_plans:
                try:
                    run_id = f"RUN-{rp.get('plan_id', str(uuid.uuid4())[:8])}"
                    # Skip if already in DB
                    existing_run = db.query(OptimizationRun).filter(
                        OptimizationRun.run_id == run_id
                    ).first()
                    if not existing_run:
                        run = OptimizationRun(
                            run_id=run_id,
                            policy=rp.get("policy", "balanced"),
                            horizon="weekly",
                            status="optimal",
                            execution_time_ms=45,
                        )
                        db.add(run)
                        db.flush()

                    existing_plan = db.query(BlockPlan).filter(
                        BlockPlan.plan_id == rp["plan_id"]
                    ).first()
                    if not existing_plan:
                        plan_db = BlockPlan(
                            plan_id=rp["plan_id"],
                            optimization_run_id=run_id,
                            plan_type=rp.get("plan_type", "weekly"),
                            policy=rp.get("policy", "balanced"),
                            status=rp.get("status", "active"),
                            is_current=True,
                        )
                        db.add(plan_db)
                        db.flush()
                except Exception as _e:
                    log.warning("Skipping remote plan sync for %s: %s", rp.get("plan_id"), _e)
                    try:
                        db.rollback()
                    except Exception:
                        pass
                    continue

                # NOTE: Remote assignments are intentionally skipped here.
                # Their task_id FK validity cannot be guaranteed in the local DB.
                # Assignments are reconstructed by the optimization service when needed.

            try:
                db.commit()
            except Exception:
                db.rollback()

            plan = (
                db.query(BlockPlan)
                .filter(BlockPlan.is_current == True)  # noqa: E712
                .order_by(desc(BlockPlan.created_at))
                .first()
            )
            if plan:
                log.info("Synced real block plan from Supabase into active database")
    return plan


def get_current_plan(db: Session) -> Optional[BlockPlan]:
    return get_current_active_plan(db)


def get_plan_by_id(db: Session, plan_id: str) -> Optional[BlockPlan]:
    return db.query(BlockPlan).filter(BlockPlan.plan_id == plan_id).first()


def get_plan(db: Session, plan_id: str) -> Optional[BlockPlan]:
    return get_plan_by_id(db, plan_id)


def save_assignment(db: Session, **kwargs) -> BlockAssignment:
    assignment = BlockAssignment(**kwargs)
    db.add(assignment)
    db.flush()
    return assignment


def get_assignments_by_plan(db: Session, plan_id: str) -> list[BlockAssignment]:
    return (
        db.query(BlockAssignment)
        .filter(BlockAssignment.plan_id == plan_id)
        .order_by(BlockAssignment.block_start)
        .all()
    )


def get_assignments_for_plan(db: Session, plan_id: str) -> list[BlockAssignment]:
    return get_assignments_by_plan(db, plan_id)


def get_assignment_by_id(db: Session, assignment_id: int) -> Optional[BlockAssignment]:
    return db.query(BlockAssignment).filter(BlockAssignment.id == assignment_id).first()


def deactivate_other_plans(db: Session, keep_plan_id: str) -> None:
    (
        db.query(BlockPlan)
        .filter(BlockPlan.plan_id != keep_plan_id, BlockPlan.is_current == True)  # noqa: E712
        .update({"is_current": False})
    )
    db.flush()


def clear_current_plans(db: Session, plan_type: Optional[str] = None) -> None:
    q = db.query(BlockPlan).filter(BlockPlan.is_current == True)  # noqa: E712
    if plan_type:
        q = q.filter(BlockPlan.plan_type == plan_type)
    q.update({"is_current": False})
    db.flush()


# ── Feedback Records ──────────────────────────────────────────

def save_feedback(db: Session, **kwargs) -> FeedbackRecord:
    rec = FeedbackRecord(**kwargs)
    db.add(rec)
    db.flush()
    return rec


def get_all_feedback(db: Session) -> list[FeedbackRecord]:
    return (
        db.query(FeedbackRecord)
        .order_by(desc(FeedbackRecord.created_at))
        .all()
    )
