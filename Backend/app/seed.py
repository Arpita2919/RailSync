"""RailSync 2.0 — Database seed script.

Populates Supabase PostgreSQL with Layer 0 synthetic data:
corridors, segments, maintenance tasks, Layer 1 risks, Layer 2 negotiation,
and an initial Layer 3 baseline plan.

Run via:
    python -m app.seed
"""

from __future__ import annotations

import argparse
from datetime import datetime

from app.core.logging import get_logger
from app.db import repositories as repo
from app.db.database import get_session_factory
from app.integrations import layer1
from app.services import optimization_service
from railsync.layer0.generator import generate_full_dataset

log = get_logger("seed")


def seed_database(seed: int = 42, run_initial_optimization: bool = True) -> None:
    """Populate database with synthetic Indian Railways network and baseline state."""
    session_factory = get_session_factory()
    session = session_factory()

    try:
        log.info("Starting RailSync 2.0 database seed (seed=%d)...", seed)

        # 1. Generate full synthetic dataset via Layer 0
        data = generate_full_dataset(seed=seed)
        segments_data = data["segments"]
        tasks_data = data["tasks"]

        log.info("Layer 0 generated: %d segments, %d tasks", len(segments_data), len(tasks_data))

        # 2. Seed Segments
        inserted_segments = 0
        for s in segments_data:
            existing = repo.get_segment(session, s["segment_id"])
            if not existing:
                repo.upsert_segment(session, **s)
                inserted_segments += 1
        log.info("Inserted %d new corridor segments (total %d)", inserted_segments, len(segments_data))

        # 3. Seed Layer 1 Risk Predictions for each segment
        for s in segments_data:
            seg_id = s["segment_id"]
            risk_pred = layer1.predict_risk(s)
            repo.save_risk_prediction(session, **{
                "segment_id": seg_id,
                "risk_30d": risk_pred["risk_30d"],
                "expected_downtime_days": risk_pred["expected_downtime_days"],
                "preventive_block_duration_hrs": risk_pred["preventive_block_duration_hrs"],
                "confidence": risk_pred["confidence"],
                "survival_curve": risk_pred.get("survival_curve"),
                "feature_contributions": risk_pred.get("feature_contributions"),
                "model_version": risk_pred.get("model_version"),
            })
        log.info("Generated and stored %d Layer 1 risk predictions", len(segments_data))

        # 4. Seed Maintenance Tasks
        inserted_tasks = 0
        for t in tasks_data:
            existing = repo.get_task(session, t["task_id"])
            if not existing:
                repo.upsert_task(session, **t)
                inserted_tasks += 1
        log.info("Inserted %d new maintenance tasks", inserted_tasks)

        session.commit()

        # 5. Run Initial Layer 3 Baseline Optimization Plan via full orchestrator
        if run_initial_optimization:
            log.info("Running initial baseline optimization pipeline (policy: balanced)...")
            opt_resp = optimization_service.run_optimization(
                session, policy="balanced", horizon="weekly"
            )
            log.info("Initial plan %s created with %d block assignments (feasible: %s)",
                     opt_resp.weekly_plan.get("plan_id") if opt_resp.weekly_plan else "N/A",
                     len(opt_resp.assignments),
                     opt_resp.feasible)

        log.info("Database seeding successfully completed on Supabase PostgreSQL!")

    except Exception as exc:
        session.rollback()
        log.error("Failed to seed database: %s", exc, exc_info=True)
        raise
    finally:
        session.close()


def main():
    parser = argparse.ArgumentParser(description="RailSync 2.0 Database Seeder")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    parser.add_argument("--no-opt", action="store_true", help="Skip initial optimization run")
    args = parser.parse_args()

    seed_database(seed=args.seed, run_initial_optimization=not args.no_opt)


if __name__ == "__main__":
    main()
