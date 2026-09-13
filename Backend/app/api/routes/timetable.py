"""RailSync 2.0 — Timetable API Routes.

Endpoints for fetching live train schedules from the RailGadi API
and generating optimized maintenance block windows.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.core.logging import get_logger
from app.services import railgadi_service

log = get_logger("routes.timetable")

router = APIRouter(prefix="/timetable", tags=["Timetable & Maintenance Blocks"])


@router.get(
    "/live",
    summary="Fetch Live Train Timetable & Generate Maintenance Blocks",
    description=(
        "Fetcheswhy wh live train schedules from the RailGadi API for all corridor trains, "
        "converts them to timetable block-unavailability windows, and computes optimized "
        "maintenance possession blocks that never conflict with passenger train movements.\n\n"
        "Returns:\n"
        "- **trains**: List of corridor trains with schedule metadata\n"
        "- **timetable_slots**: Per-segment train occupation windows\n"
        "- **maintenance_blocks**: Proposed zero-conflict maintenance windows\n"
        "- **summary**: Stats on fetch success, block counts, and execution time"
    ),
)
async def get_live_timetable(
    days: int = Query(default=7, ge=1, le=30, description="Number of days to plan (1-30)"),
):
    """Fetch live timetable and generate optimized maintenance blocks."""
    try:
        result = await railgadi_service.get_full_timetable_with_blocks(days=days)
        return result
    except Exception as e:
        log.error("Timetable fetch failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Timetable generation failed: {type(e).__name__}: {str(e)}",
        )


@router.get(
    "/trains",
    summary="List Corridor Trains",
    description="Returns the list of configured corridor train numbers and their metadata.",
)
async def list_corridor_trains():
    """List all corridor trains with their API fetch status."""
    result = await railgadi_service.fetch_corridor_timetable()
    return {
        "trains": result["trains"],
        "total": result["total_trains"],
        "from_api": result["fetched_count"],
        "from_fixture": result["fixture_count"],
        "errors": result["fetch_errors"],
        "last_updated": result["last_updated"],
    }


@router.get(
    "/blocks",
    summary="Generate Maintenance Blocks Only",
    description=(
        "Generates optimized maintenance block windows using the current timetable data. "
        "Returns only the block schedule without full timetable slot details."
    ),
)
async def get_maintenance_blocks(
    days: int = Query(default=7, ge=1, le=30, description="Number of days to plan"),
    segment: str | None = Query(default=None, description="Filter by segment ID (e.g. SEG-001)"),
):
    """Generate and return maintenance blocks, optionally filtered by segment."""
    try:
        result = await railgadi_service.get_full_timetable_with_blocks(days=days)
        blocks = result["maintenance_blocks"]

        if segment:
            blocks = [b for b in blocks if b["segment_id"] == segment.upper()]

        return {
            "maintenance_blocks": blocks,
            "total_blocks": len(blocks),
            "total_block_hours": round(sum(b["duration_hrs"] for b in blocks), 1),
            "segment_filter": segment,
            "days": days,
            "summary": result["summary"],
        }
    except Exception as e:
        log.error("Block generation failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Block generation failed: {type(e).__name__}: {str(e)}",
        )


@router.get(
    "/schedule/{train_number}",
    summary="Fetch Schedule for a Specific Train",
    description="Fetches the schedule for a specific train number from the RailGadi API or fixture fallback.",
)
async def get_train_schedule(train_number: str):
    """Get the schedule for a specific train."""
    try:
        api_data = await railgadi_service.fetch_train_schedule_from_api(train_number)
        if api_data:
            adapted = railgadi_service._adapt_api_response_to_fixture(api_data, train_number)
            if adapted:
                adapted["source"] = "railgadi_api"
                return {"train": adapted, "source": "api"}

        # Fallback to fixture
        from railsync.layer0.timetable_fixture import PUBLISHED_TRAIN_FIXTURES
        fixture_map = {t["train_number"]: t for t in PUBLISHED_TRAIN_FIXTURES}
        if train_number in fixture_map:
            return {"train": fixture_map[train_number], "source": "fixture"}

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Train {train_number} not found in API or fixtures",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch train schedule: {str(e)}",
        )
