"""RailSync 2.0 — Database seed script (DISABLED).

Auto-seeding of synthetic data has been removed. All segments, tasks, and
risk predictions must be submitted by the user through the API.

Previously this module populated Supabase PostgreSQL with Layer 0 synthetic
data (corridors, segments, maintenance tasks, Layer 1 risks, Layer 2
negotiation, and an initial Layer 3 baseline plan). That behaviour masked
the system as a hardcoded demo rather than a user-driven tool.

If you need to populate a fresh database for local development, use the
API ingest endpoints instead:
    POST /ingest/segments
    POST /ingest/tasks
    POST /optimize
"""

from __future__ import annotations

import argparse

from app.core.logging import get_logger

log = get_logger("seed")


def seed_database(seed: int = 42, run_initial_optimization: bool = True) -> None:
    """No-op stub — auto-seeding is disabled.

    Previously populated the database with synthetic Indian Railways network
    data and a baseline optimization plan.  Now prints a deprecation notice
    so that any leftover call-site does not crash silently.
    """
    log.warning(
        "seed_database() is disabled. Auto-seeding of synthetic data has been "
        "removed. Submit segments and tasks through the API instead."
    )


def main():
    parser = argparse.ArgumentParser(description="RailSync 2.0 Database Seeder")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    parser.add_argument("--no-opt", action="store_true", help="Skip initial optimization run")
    args = parser.parse_args()

    # Display banner safely handling UnicodeEncodeError on Windows consoles
    try:
        print(
            "\n"
            "╔══════════════════════════════════════════════════════════════╗\n"
            "║  RailSync 2.0 — Auto-seeding DISABLED                      ║\n"
            "║                                                             ║\n"
            "║  Synthetic data is no longer injected into the database.    ║\n"
            "║  Submit your segments and tasks through the REST API:       ║\n"
            "║                                                             ║\n"
            "║    POST /ingest/segments                                    ║\n"
            "║    POST /ingest/tasks                                       ║\n"
            "║    POST /optimize                                           ║\n"
            "╚══════════════════════════════════════════════════════════════╝\n"
        )
    except UnicodeEncodeError:
        # Fallback: write UTF‑8 encoded bytes directly to stdout buffer
        import sys
        banner = (
            "\n"
            "╔══════════════════════════════════════════════════════════════╗\n"
            "║  RailSync 2.0 — Auto-seeding DISABLED                      ║\n"
            "║                                                             ║\n"
            "║  Synthetic data is no longer injected into the database.    ║\n"
            "║  Submit your segments and tasks through the REST API:       ║\n"
            "║                                                             ║\n"
            "║    POST /ingest/segments                                    ║\n"
            "║    POST /ingest/tasks                                       ║\n"
            "║    POST /optimize                                           ║\n"
            "╚══════════════════════════════════════════════════════════════╝\n"
        )
        sys.stdout.buffer.write(banner.encode("utf-8"))
        sys.stdout.flush()


if __name__ == "__main__":
    main()
