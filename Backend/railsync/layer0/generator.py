"""RailSync 2.0 — Layer 0: Causal synthetic data generator for Indian Railways.

Generates segments, timetable slots, goods forecasts, and maintenance tasks
with deterministic seeding for reproducible demos.

NOTE: This module is NOT auto-invoked at startup. It exists as a utility for:
  - CLI-driven database seeding (opt-in, not automatic)
  - Test fixtures
  - Prototype timetable generation (used by optimization_service / whatif_service
    until a real timetable ingest endpoint is implemented)
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from typing import Any

from railsync.layer0.corridors import (
    ASSET_TYPES,
    CORRIDORS,
    CURVE_GRADIENT_CLASSES,
    DEPARTMENTS,
    FREIGHT_DENSITY_CLASSES,
    MONSOON_EXPOSURE_LEVELS,
    TASK_TYPES_BY_DEPT,
)


from railsync.layer0.timetable_fixture import PUBLISHED_TRAIN_FIXTURES


def generate_segments(seed: int = 42, segments_per_corridor: int = 10) -> list[dict[str, Any]]:
    """Generate realistic corridor segment records."""
    rng = random.Random(seed)
    segments = []
    seg_idx = 1

    for corridor_key, corridor in CORRIDORS.items():
        divisions = corridor["divisions"]
        total_km = corridor["total_km"]
        km_per_seg = total_km / segments_per_corridor

        for i in range(segments_per_corridor):
            div = divisions[i * len(divisions) // segments_per_corridor]
            age = rng.uniform(3, 45)
            install_year = 2026 - int(age)

            segments.append({
                "segment_id": f"SEG-{seg_idx:03d}",
                "division": div,
                "section": f"{div}-Sec{i + 1}",
                "corridor": corridor["name"],
                "asset_type": rng.choice(ASSET_TYPES),
                "length_km": round(km_per_seg + rng.uniform(-5, 5), 1),
                "age_years": round(age, 1),
                "installation_year": install_year,
                "curve_gradient_class": rng.choice(CURVE_GRADIENT_CLASSES),
                "monsoon_exposure": rng.choice(MONSOON_EXPOSURE_LEVELS),
                "freight_density_class": rng.choice(FREIGHT_DENSITY_CLASSES),
            })
            seg_idx += 1

    return segments


def generate_timetable(
    seed: int = 42,
    base_date: datetime | None = None,
    days: int = 7,
    trains_per_day: int = 18,
    use_real_fixture: bool = True,
) -> list[dict[str, Any]]:
    """Generate timetable block-unavailability windows based on real published train schedules."""
    if base_date is None:
        base_date = datetime(2026, 9, 15, 0, 0, 0)

    if not use_real_fixture:
        # Fallback synthetic generator for testing custom counts
        rng = random.Random(seed)
        slots = []
        for day_offset in range(days):
            day = base_date + timedelta(days=day_offset)
            for t in range(trains_per_day):
                hour = rng.randint(4, 23)
                minute = rng.choice([0, 10, 20, 30, 40, 50])
                start = day.replace(hour=hour, minute=minute, second=0)
                duration_min = rng.choice([15, 20, 25, 30, 45])
                slots.append({
                    "train_id": f"TR-{day_offset * 100 + t + 1:04d}",
                    "start": start,
                    "end": start + timedelta(minutes=duration_min),
                    "priority": rng.choice(["rajdhani", "express", "mail", "passenger", "goods"]),
                })
        return slots

    slots = []
    for day_offset in range(days):
        day = base_date + timedelta(days=day_offset)
        for train in PUBLISHED_TRAIN_FIXTURES:
            dep_parts = train["dep_time_str"].split(":")
            dep_hour = int(dep_parts[0])
            dep_min = int(dep_parts[1])
            dep_dt = day.replace(hour=dep_hour, minute=dep_min, second=0)

            for passage in train["segment_passages"]:
                start_dt = dep_dt + timedelta(minutes=passage["entry_offset_min"])
                end_dt = dep_dt + timedelta(minutes=passage["exit_offset_min"])
                slots.append({
                    "train_id": f"IR-{train['train_number']}-D{day_offset + 1}",
                    "train_number": train["train_number"],
                    "train_name": train["train_name"],
                    "segment_id": passage["segment_id"],
                    "segment": passage["segment_id"],
                    "start": start_dt,
                    "end": end_dt,
                    "priority": train["priority"],
                })

    return slots


def generate_goods_forecast(
    seed: int = 42,
    base_date: datetime | None = None,
    days: int = 7,
    timetable: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Generate goods train frequency forecast shaped by real passenger track traffic."""
    rng = random.Random(seed + 100)
    if base_date is None:
        base_date = datetime(2026, 9, 15, 0, 0, 0)

    if timetable is None:
        timetable = generate_timetable(seed=seed, base_date=base_date, days=days, use_real_fixture=True)

    forecasts = []
    for day_offset in range(days):
        day = base_date + timedelta(days=day_offset)
        day_str = day.date().isoformat()

        # Calculate passenger traffic density on this date
        pass_slots_today = [
            t for t in timetable
            if isinstance(t.get("start"), datetime) and t["start"].date() == day.date()
        ]

        slot_count = len(pass_slots_today)

        # Freight is shaped inversely to passenger rush:
        # Off-peak freight windows: 01:00-05:00 and 11:30-14:30
        off_peak_freight_hours = [1, 2, 3, 4, 12, 13]
        peak_passenger_hours = [6, 7, 8, 17, 18, 19, 20]

        # Higher passenger density => freight is tightly scheduled into off-peak
        expected_goods = max(10, min(32, 28 - (slot_count // 15) + rng.randint(-2, 3)))
        congestion = "high" if slot_count > 30 else ("medium" if slot_count > 15 else "low")

        forecasts.append({
            "date": day_str,
            "expected_goods_trains": expected_goods,
            "passenger_slot_count": slot_count,
            "peak_hours": off_peak_freight_hours[:2] if congestion == "high" else off_peak_freight_hours,
            "passenger_peak_hours": peak_passenger_hours,
            "congestion_level": congestion,
            "recommended_freight_windows": ["01:00-05:00", "11:30-14:30"],
        })

    return forecasts


def generate_maintenance_tasks(
    segments: list[dict[str, Any]],
    seed: int = 42,
    tasks_per_segment: int = 2,
    base_date: datetime | None = None,
) -> list[dict[str, Any]]:
    """Generate maintenance task backlog for given segments."""
    rng = random.Random(seed + 200)
    if base_date is None:
        base_date = datetime(2026, 9, 15, 6, 0, 0)

    tasks = []
    task_idx = 1

    for seg in segments:
        n = rng.randint(1, tasks_per_segment + 1)
        for _ in range(n):
            dept = rng.choice(DEPARTMENTS)
            task_type = rng.choice(TASK_TYPES_BY_DEPT[dept])

            # Causal: older assets → higher base criticality
            age_factor = min(seg["age_years"] / 40.0, 1.0)
            base_crit = 1 + int(age_factor * 3)
            # Departments sometimes inflate claims
            inflation = rng.randint(0, 2)
            claimed = min(base_crit + inflation, 5)

            min_dur = round(rng.uniform(0.5, 4.0), 1)
            window_start = base_date + timedelta(hours=rng.randint(0, 48))
            window_end = window_start + timedelta(hours=rng.randint(4, 12))

            tasks.append({
                "task_id": f"TASK-{task_idx:03d}",
                "segment_id": seg["segment_id"],
                "department": dept,
                "task_type": task_type,
                "claimed_criticality": claimed,
                "min_duration_hrs": min_dur,
                "preferred_window_start": window_start,
                "preferred_window_end": window_end,
                "overdue": rng.random() < (0.15 + age_factor * 0.25),
                "status": "pending",
            })
            task_idx += 1

    return tasks


def generate_full_dataset(seed: int = 42) -> dict[str, Any]:
    """Generate a complete interconnected dataset for demo/seeding."""
    segments = generate_segments(seed=seed)
    tasks = generate_maintenance_tasks(segments, seed=seed)
    timetable = generate_timetable(seed=seed)
    goods = generate_goods_forecast(seed=seed)

    return {
        "segments": segments,
        "tasks": tasks,
        "timetable": timetable,
        "goods_forecast": goods,
    }
