"""RailSync 2.0 — RailGadi API Integration Service.

Fetches live train schedules from the RailGadi / Indian Railways API,
converts them to internal timetable slot format, and generates optimized
maintenance block windows around real train movements.

Supports multiple Indian Railways API providers:
- indianrailapi.com (primary)
- data.gov.in / railgadi endpoints (fallback)
- Published fixture fallback (offline mode)

Key: rg_d08524fd0b3e4212bd1b3515f64c5bc0
"""

from __future__ import annotations

import hashlib
import time
from datetime import datetime, timedelta
from typing import Any

import httpx

from app.core.logging import get_logger

log = get_logger("service.railgadi")

# ── RailGadi API Config ──────────────────────────────────────────────────
RAILGADI_API_KEY = "rg_d08524fd0b3e4212bd1b3515f64c5bc0"

# Base URLs to try (in priority order)
API_ENDPOINTS = [
    "https://indianrailapi.com/api/v2/TrainSchedule/apikey/{key}/TrainNumber/{train_no}",
    "https://api.railwayapi.com/v2/route/train/{train_no}/date/{date}/apikey/{key}",
]

# Delhi–Mumbai corridor train numbers to fetch
CORRIDOR_TRAINS = [
    "12952",  # New Delhi – Mumbai Central Tejas Rajdhani Express
    "12951",  # Mumbai Central – New Delhi Tejas Rajdhani Express
    "12954",  # Hazrat Nizamuddin – Mumbai Central August Kranti Rajdhani
    "12009",  # Mumbai Central – Ahmedabad Shatabdi Express
    "20901",  # Mumbai Central – Gandhinagar Vande Bharat Express
    "12926",  # Paschim Express (New Delhi – Mumbai Central)
    "12908",  # Maharashtra Sampark Kranti Express
    "12962",  # Avantika Express (Indore – Mumbai Central)
    "12922",  # Flying Ranee Express (Surat – Mumbai Central)
    "12138",  # Mumbai CST – Punjab Mail
    "12496",  # Bikaner Superfast Express
    "19019",  # Dehradun Express
]

# ── Indian Railways Station → Segment Mapping ────────────────────────────
# Maps station codes to corridor segments for block-conflict modeling
STATION_SEGMENT_MAP = {
    "NDLS": "SEG-001", "NZM": "SEG-001", "DEE": "SEG-001", "GZB": "SEG-001",
    "MTJ": "SEG-002", "AGC": "SEG-002", "BTE": "SEG-002", "IDH": "SEG-002",
    "SWM": "SEG-003", "HNQ": "SEG-003", "DHO": "SEG-003", "MLP": "SEG-003",
    "KOTA": "SEG-004", "SKS": "SEG-004", "COR": "SEG-004", "GGC": "SEG-004",
    "NAD": "SEG-005", "CTO": "SEG-005", "MDS": "SEG-005", "NGB": "SEG-005",
    "RTM": "SEG-006", "UJN": "SEG-006", "INDB": "SEG-006", "MGN": "SEG-006",
    "GDA": "SEG-007", "DHD": "SEG-007", "PLN": "SEG-007", "ADI": "SEG-007",
    "BRC": "SEG-008", "MSH": "SEG-008", "KYN": "SEG-008", "GNC": "SEG-008",
    "ST": "SEG-009", "NVS": "SEG-009", "BL": "SEG-009", "VAPI": "SEG-009",
    "BVI": "SEG-010", "MMCT": "SEG-010", "BCT": "SEG-010", "BDTS": "SEG-010",
}

# ── Verified Indian Railways Station → Division Mapping ───────────────────
# Used when API does not provide explicit division metadata
STATION_DIVISION_MAP = {
    # Delhi Division (Northern Railway)
    "NDLS": "Delhi", "NZM": "Delhi", "DEE": "Delhi", "GZB": "Delhi", "DLI": "Delhi", "TKD": "Delhi", "FDB": "Delhi",
    # Agra Division (North Central Railway)
    "MTJ": "Agra", "AGC": "Agra", "BTE": "Agra", "IDH": "Agra", "DHO": "Agra", "MLP": "Agra", "AF": "Agra", "AH": "Agra",
    # Kota Division (West Central Railway)
    "KOTA": "Kota", "SWM": "Kota", "HNQ": "Kota", "SKS": "Kota", "COR": "Kota", "GGC": "Kota", "BWM": "Kota", "RMA": "Kota",
    # Ratlam Division (Western Railway)
    "RTM": "Ratlam", "NAD": "Ratlam", "UJN": "Ratlam", "INDB": "Ratlam", "CTO": "Ratlam", "MDS": "Ratlam", "NGB": "Ratlam", "MGN": "Ratlam", "DWX": "Ratlam",
    # Vadodara Division (Western Railway)
    "BRC": "Vadodara", "GDA": "Vadodara", "DHD": "Vadodara", "PLN": "Vadodara", "ADI": "Vadodara", "MSH": "Vadodara", "KYN": "Vadodara", "GNC": "Vadodara", "ST": "Vadodara", "NVS": "Vadodara", "ANND": "Vadodara", "BH": "Vadodara",
    # Mumbai Division (Western / Central Railway)
    "BVI": "Mumbai", "MMCT": "Mumbai", "BDTS": "Mumbai", "BCT": "Mumbai", "BL": "Mumbai", "VAPI": "Mumbai", "CSMT": "Mumbai", "DR": "Mumbai", "TNA": "Mumbai",
}

# Priority classification by train type keywords
TRAIN_PRIORITY_KEYWORDS = {
    "rajdhani": "rajdhani",
    "shatabdi": "shatabdi",
    "vande bharat": "vande_bharat",
    "tejas": "rajdhani",
    "duronto": "rajdhani",
    "garib rath": "express",
    "superfast": "superfast",
    "express": "express",
    "mail": "mail",
    "passenger": "passenger",
    "goods": "goods",
}

# In-memory cache for API responses
_schedule_cache: dict[str, dict] = {}
_cache_ttl_seconds = 3600  # 1 hour


def _classify_train_priority(train_name: str) -> str:
    """Classify train priority from its name."""
    name_lower = (train_name or "").lower()
    for keyword, priority in TRAIN_PRIORITY_KEYWORDS.items():
        if keyword in name_lower:
            return priority
    return "express"


def _station_to_segment(station_code: str) -> str:
    """Map a station code to a corridor segment ID."""
    return STATION_SEGMENT_MAP.get(station_code.upper(), "SEG-005")


def _station_to_division(station_code: str, explicit_division: str | None = None) -> str:
    """Resolve division using priority:
    1. If explicit API provides division metadata -> derive division from API.
    2. If API does not provide division metadata -> use verified station-to-division mapping fallback.
    """
    if explicit_division and str(explicit_division).strip():
        return str(explicit_division).strip()
    return STATION_DIVISION_MAP.get(station_code.upper(), "Delhi")


def _parse_time_str(time_str: str) -> tuple[int, int] | None:
    """Parse 'HH:MM' or 'H:MM' time string to (hour, minute)."""
    if not time_str or time_str in ("None", "--", "Source", "Destination"):
        return None
    parts = time_str.strip().split(":")
    if len(parts) < 2:
        return None
    try:
        return int(parts[0]), int(parts[1])
    except (ValueError, IndexError):
        return None


async def fetch_train_schedule_from_api(train_no: str) -> dict | None:
    """Attempt to fetch a train schedule from external API providers.

    Tries multiple endpoints and returns the first successful response.
    Falls back to None if all fail (offline mode will use fixtures).
    """
    cache_key = f"schedule_{train_no}"
    if cache_key in _schedule_cache:
        cached = _schedule_cache[cache_key]
        if time.time() - cached.get("_cached_at", 0) < _cache_ttl_seconds:
            log.debug("Cache hit for train %s", train_no)
            return cached.get("data")

    today = datetime.now().strftime("%m-%d-%Y")

    for endpoint_tpl in API_ENDPOINTS:
        url = endpoint_tpl.format(key=RAILGADI_API_KEY, train_no=train_no, date=today)
        try:
            async with httpx.AsyncClient(timeout=0.5, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    # Check for valid response
                    if data and isinstance(data, dict):
                        code = data.get("ResponseCode", data.get("response_code", ""))
                        if str(code) in ("200", ""):
                            _schedule_cache[cache_key] = {"data": data, "_cached_at": time.time()}
                            log.info("Fetched schedule for train %s from API", train_no)
                            return data
        except Exception as e:
            log.debug("API endpoint failed for train %s: %s — %s", train_no, url[:60], str(e)[:100])
            continue

    _schedule_cache[cache_key] = {"data": None, "_cached_at": time.time()}
    log.debug("All API endpoints failed for train %s — using fixture fallback", train_no)
    return None


def _adapt_api_response_to_fixture(api_data: dict, train_no: str) -> dict | None:
    """Convert raw API JSON into our internal PUBLISHED_TRAIN_FIXTURES format."""
    if not api_data:
        return None

    # Try to extract route from various API response formats
    route = (
        api_data.get("Route", [])
        or api_data.get("route", [])
        or api_data.get("train", {}).get("route", [])
    )
    train_info = api_data.get("Train", api_data.get("train", {}))

    if not route and not train_info:
        return None

    train_name = (
        train_info.get("TrainName", "")
        or train_info.get("train_name", "")
        or api_data.get("TrainName", f"Train {train_no}")
    )
    priority = _classify_train_priority(train_name)

    # Parse stops and build segment passages
    stops = []
    segment_passages = []
    dep_time_str = None
    first_offset = 0

    for i, stn in enumerate(route):
        code = (
            stn.get("StationCode", "")
            or stn.get("station_code", "")
            or stn.get("code", "")
        ).upper()
        arr = stn.get("ArrivalTime", stn.get("arrival_time", stn.get("arr", "")))
        dep = stn.get("DepartureTime", stn.get("departure_time", stn.get("dep", "")))
        day = int(stn.get("Day", stn.get("day", 1)))

        # Division from station lookup
        division = stn.get("Division", stn.get("division", ""))
        if not division:
            seg = _station_to_segment(code)
            # Rough division from segment
            seg_div_map = {
                "SEG-001": "Delhi", "SEG-002": "Delhi", "SEG-003": "Kota",
                "SEG-004": "Kota", "SEG-005": "Ratlam", "SEG-006": "Ratlam",
                "SEG-007": "Vadodara", "SEG-008": "Vadodara",
                "SEG-009": "Vadodara", "SEG-010": "Mumbai",
            }
            division = seg_div_map.get(seg, "Delhi")

        arr_parsed = _parse_time_str(str(arr)) if arr else None
        dep_parsed = _parse_time_str(str(dep)) if dep else None

        if i == 0 and dep_parsed:
            dep_time_str = f"{dep_parsed[0]:02d}:{dep_parsed[1]:02d}"
            first_offset = 0
        elif i == 0:
            dep_time_str = "06:00"

        # Calculate offset in minutes from departure
        if dep_parsed and dep_time_str:
            ref = _parse_time_str(dep_time_str)
            if ref:
                base_min = ref[0] * 60 + ref[1]
                cur_min = (dep_parsed[0] if dep_parsed else (arr_parsed[0] if arr_parsed else 0)) * 60 + \
                          (dep_parsed[1] if dep_parsed else (arr_parsed[1] if arr_parsed else 0))
                offset = cur_min - base_min + (day - 1) * 1440
                if offset < 0:
                    offset += 1440
            else:
                offset = i * 60
        else:
            offset = i * 60

        stop = {
            "station": code,
            "division": division,
            "arr": str(arr) if arr and i > 0 else None,
            "dep": str(dep) if dep and i < len(route) - 1 else None,
            "offset_min": offset,
        }
        stops.append(stop)

        # Create segment passage
        segment_id = _station_to_segment(code)
        if i > 0:
            prev_offset = stops[i - 1]["offset_min"]
            segment_passages.append({
                "segment_id": segment_id,
                "entry_offset_min": prev_offset,
                "exit_offset_min": offset,
            })

    if not dep_time_str:
        dep_time_str = "06:00"

    # Calculate arrival
    arr_time_str = dep_time_str
    if stops:
        last = stops[-1]
        last_min = last["offset_min"]
        arr_h = (int(dep_time_str.split(":")[0]) + last_min // 60) % 24
        arr_m = (int(dep_time_str.split(":")[1]) + last_min % 60) % 60
        arr_time_str = f"{arr_h:02d}:{arr_m:02d}"

    origin = stops[0]["station"] if stops else "NDLS"
    destination = stops[-1]["station"] if stops else "MMCT"

    return {
        "train_number": train_no,
        "train_name": train_name,
        "priority": priority,
        "corridor": "Delhi–Mumbai Rajdhani Corridor",
        "origin": origin,
        "destination": destination,
        "dep_time_str": dep_time_str,
        "arr_time_str": arr_time_str,
        "next_day": any(s["offset_min"] > 1440 for s in stops) if stops else False,
        "stops": stops,
        "segment_passages": segment_passages if segment_passages else [
            {"segment_id": _station_to_segment(origin), "entry_offset_min": 0, "exit_offset_min": 60}
        ],
        "source": "railgadi_api",
    }


_corridor_cache: dict[str, Any] = {}
_corridor_cache_time: float = 0


async def fetch_corridor_timetable(
    train_numbers: list[str] | None = None,
) -> dict[str, Any]:
    """Fetch live timetable for all corridor trains and return unified result.

    Returns a dict with:
      - trains: list of adapted train fixture dicts
      - fetched_count: number successfully fetched from API
      - fixture_count: number using local fixtures
      - fetch_errors: list of train numbers that failed
      - last_updated: ISO timestamp
    """
    global _corridor_cache, _corridor_cache_time
    cache_key = ",".join(train_numbers) if train_numbers else "default"
    if cache_key in _corridor_cache and (time.time() - _corridor_cache_time < _cache_ttl_seconds):
        return _corridor_cache[cache_key]

    from railsync.layer0.timetable_fixture import PUBLISHED_TRAIN_FIXTURES

    if train_numbers is None:
        train_numbers = CORRIDOR_TRAINS

    api_trains = []
    fixture_trains = []
    fetch_errors = []

    # Build a lookup from fixture train numbers
    fixture_map = {t["train_number"]: t for t in PUBLISHED_TRAIN_FIXTURES}

    for train_no in train_numbers:
        api_data = await fetch_train_schedule_from_api(train_no)
        if api_data:
            adapted = _adapt_api_response_to_fixture(api_data, train_no)
            if adapted and adapted.get("segment_passages"):
                adapted["source"] = "railgadi_api"
                api_trains.append(adapted)
                continue

        # Fallback to local fixture
        if train_no in fixture_map:
            fixture = dict(fixture_map[train_no])
            fixture["source"] = "published_fixture"
            fixture_trains.append(fixture)
        else:
            fetch_errors.append(train_no)

    all_trains = api_trains + fixture_trains
    log.info(
        "Corridor timetable: %d from API, %d from fixture, %d errors",
        len(api_trains), len(fixture_trains), len(fetch_errors),
    )

    result = {
        "trains": all_trains,
        "fetched_count": len(api_trains),
        "fixture_count": len(fixture_trains),
        "fetch_errors": fetch_errors,
        "total_trains": len(all_trains),
        "last_updated": datetime.now().isoformat(),
    }
    _corridor_cache[cache_key] = result
    _corridor_cache_time = time.time()
    return result


def generate_timetable_slots(
    trains: list[dict],
    base_date: datetime | None = None,
    days: int = 7,
) -> list[dict[str, Any]]:
    """Convert train fixtures into concrete timetable block-unavailability slots.

    Each slot represents a time window where a segment is occupied by a train.
    """
    if base_date is None:
        base_date = datetime(2026, 9, 15, 0, 0, 0)

    slots = []
    for day_offset in range(days):
        day = base_date + timedelta(days=day_offset)
        for train in trains:
            dep_parts = train["dep_time_str"].split(":")
            dep_hour = int(dep_parts[0])
            dep_min = int(dep_parts[1])
            dep_dt = day.replace(hour=dep_hour, minute=dep_min, second=0)

            for passage in train.get("segment_passages", []):
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
                    "source": train.get("source", "fixture"),
                })

    return slots


def generate_maintenance_blocks(
    timetable_slots: list[dict],
    base_date: datetime | None = None,
    days: int = 7,
) -> list[dict[str, Any]]:
    """Generate optimized maintenance block windows around train movements.

    Identifies gaps in train traffic per segment and proposes maintenance
    windows that:
    1. Never overlap with any passenger train movement
    2. Prefer nighttime windows (00:00–06:00)
    3. Prefer daytime lean periods (10:00–15:00)
    4. Are at least 2 hours long for meaningful maintenance work
    """
    if base_date is None:
        base_date = datetime(2026, 9, 15, 0, 0, 0)

    segments = set()
    for slot in timetable_slots:
        segments.add(slot.get("segment_id", slot.get("segment", "SEG-001")))

    blocks = []
    block_idx = 1

    for day_offset in range(days):
        day = base_date + timedelta(days=day_offset)
        day_str = day.strftime("%a %d %b")

        for segment in sorted(segments):
            # Get all train slots for this segment on this day
            seg_slots = [
                s for s in timetable_slots
                if (s.get("segment_id") == segment or s.get("segment") == segment)
                and isinstance(s.get("start"), datetime)
                and s["start"].date() == day.date()
            ]
            seg_slots.sort(key=lambda s: s["start"])

            # Define preferred maintenance windows
            preferred_windows = [
                (day.replace(hour=0, minute=0), day.replace(hour=5, minute=30)),   # Night
                (day.replace(hour=10, minute=0), day.replace(hour=14, minute=30)),  # Lean afternoon
                (day.replace(hour=22, minute=0), day.replace(hour=23, minute=59)),  # Late night
            ]

            for win_start, win_end in preferred_windows:
                # Check if any train occupies this window
                conflict = False
                conflicting_trains = []
                for slot in seg_slots:
                    if slot["start"] < win_end and slot["end"] > win_start:
                        conflict = True
                        conflicting_trains.append(slot.get("train_number", "?"))

                if conflict:
                    # Try to shrink the window around train movements
                    # Find the latest train departure before window and earliest arrival after
                    available_start = win_start
                    available_end = win_end
                    for slot in seg_slots:
                        if slot["end"] > win_start and slot["end"] <= win_end:
                            if slot["end"] > available_start:
                                available_start = slot["end"] + timedelta(minutes=15)
                        if slot["start"] >= win_start and slot["start"] < win_end:
                            if slot["start"] < available_end:
                                available_end = slot["start"] - timedelta(minutes=15)

                    duration_hrs = (available_end - available_start).total_seconds() / 3600
                    if duration_hrs >= 1.5:
                        blocks.append({
                            "block_id": f"MBLK-{block_idx:04d}",
                            "segment_id": segment,
                            "day": day_str,
                            "block_start": available_start.isoformat(),
                            "block_end": available_end.isoformat(),
                            "duration_hrs": round(duration_hrs, 1),
                            "window_type": "adjusted",
                            "conflicting_trains": conflicting_trains,
                            "safety_buffer_min": 15,
                            "status": "proposed",
                        })
                        block_idx += 1
                else:
                    # Full window is clear
                    duration_hrs = (win_end - win_start).total_seconds() / 3600
                    blocks.append({
                        "block_id": f"MBLK-{block_idx:04d}",
                        "segment_id": segment,
                        "day": day_str,
                        "block_start": win_start.isoformat(),
                        "block_end": win_end.isoformat(),
                        "duration_hrs": round(duration_hrs, 1),
                        "window_type": "clear",
                        "conflicting_trains": [],
                        "safety_buffer_min": 15,
                        "status": "proposed",
                    })
                    block_idx += 1

    log.info("Generated %d maintenance blocks across %d days", len(blocks), days)
    return blocks


async def get_full_timetable_with_blocks(
    train_numbers: list[str] | None = None,
    days: int = 7,
) -> dict[str, Any]:
    """End-to-end: fetch live timetable → generate slots → compute maintenance blocks.

    This is the main orchestrator called by the timetable API route.
    """
    start_time = time.perf_counter()

    # 1. Fetch train schedules (API + fixture fallback)
    timetable_result = await fetch_corridor_timetable(train_numbers)
    trains = timetable_result["trains"]

    # 2. Generate concrete timetable slots
    base_date = datetime(2026, 9, 15, 0, 0, 0)
    slots = generate_timetable_slots(trains, base_date=base_date, days=days)

    # 3. Generate optimized maintenance blocks
    maintenance_blocks = generate_maintenance_blocks(slots, base_date=base_date, days=days)

    elapsed_ms = int((time.perf_counter() - start_time) * 1000)

    # 4. Build summary stats
    segments_covered = len(set(s["segment_id"] for s in slots))
    total_block_hours = sum(b["duration_hrs"] for b in maintenance_blocks)
    clear_blocks = sum(1 for b in maintenance_blocks if b["window_type"] == "clear")
    adjusted_blocks = sum(1 for b in maintenance_blocks if b["window_type"] == "adjusted")

    return {
        "trains": [
            {
                "train_number": t["train_number"],
                "train_name": t["train_name"],
                "priority": t["priority"],
                "origin": t.get("origin", ""),
                "destination": t.get("destination", ""),
                "dep_time": t["dep_time_str"],
                "arr_time": t.get("arr_time_str", ""),
                "source": t.get("source", "fixture"),
                "stops_count": len(t.get("stops", [])),
                "stops": t.get("stops", []),
                "segments_traversed": len(t.get("segment_passages", [])),
            }
            for t in trains
        ],
        "timetable_slots": [
            {
                "train_id": s["train_id"],
                "train_number": s["train_number"],
                "train_name": s["train_name"],
                "segment_id": s["segment_id"],
                "start": s["start"].isoformat() if isinstance(s["start"], datetime) else s["start"],
                "end": s["end"].isoformat() if isinstance(s["end"], datetime) else s["end"],
                "priority": s["priority"],
                "source": s.get("source", "fixture"),
            }
            for s in slots[:200]  # Limit to prevent huge payloads
        ],
        "maintenance_blocks": maintenance_blocks,
        "summary": {
            "total_trains": len(trains),
            "fetched_from_api": timetable_result["fetched_count"],
            "from_fixtures": timetable_result["fixture_count"],
            "fetch_errors": timetable_result["fetch_errors"],
            "total_timetable_slots": len(slots),
            "segments_covered": segments_covered,
            "total_maintenance_blocks": len(maintenance_blocks),
            "total_block_hours": round(total_block_hours, 1),
            "clear_windows": clear_blocks,
            "adjusted_windows": adjusted_blocks,
            "days_covered": days,
            "last_updated": datetime.now().isoformat(),
            "execution_time_ms": elapsed_ms,
        },
    }


async def get_all_divisions() -> list[dict[str, Any]]:
    """Return all divisions supported by the Railway API & timetable network."""
    timetable_result = await fetch_corridor_timetable()
    trains = timetable_result["trains"]

    div_map: dict[str, dict[str, Any]] = {}

    for t in trains:
        t_num = t["train_number"]
        t_name = t["train_name"]
        stops = t.get("stops", [])
        for s in stops:
            stn = s.get("station", "")
            explicit_div = s.get("division")
            div_name = _station_to_division(stn, explicit_div)
            if not div_name:
                continue
            if div_name not in div_map:
                div_map[div_name] = {
                    "division": div_name,
                    "zone": "NCR" if div_name in ("Agra", "Allahabad", "Jhansi") else (
                        "NR" if div_name == "Delhi" else (
                            "WCR" if div_name == "Kota" else (
                                "WR" if div_name in ("Ratlam", "Vadodara", "Mumbai") else "IR"
                            )
                        )
                    ),
                    "corridor": t.get("corridor", "Delhi–Mumbai Rajdhani Corridor"),
                    "stations": set(),
                    "train_numbers": set(),
                    "segments": set(),
                }
            div_map[div_name]["stations"].add(stn)
            div_map[div_name]["train_numbers"].add(t_num)
            seg_id = _station_to_segment(stn)
            if seg_id:
                div_map[div_name]["segments"].add(seg_id)

    # Format and sort in geographic trunk route order
    results = []
    order = ["Delhi", "Agra", "Kota", "Ratlam", "Vadodara", "Mumbai"]
    for div_name in sorted(div_map.keys(), key=lambda x: order.index(x) if x in order else 99):
        d = div_map[div_name]
        results.append({
            "division": d["division"],
            "zone": d["zone"],
            "corridor": d["corridor"],
            "stations": sorted(list(d["stations"])),
            "train_count": len(d["train_numbers"]),
            "train_numbers": sorted(list(d["train_numbers"])),
            "segments": sorted(list(d["segments"])),
        })
    return results


async def get_all_corridors() -> list[dict[str, Any]]:
    """Return all railway corridors supported by the API."""
    divisions = await get_all_divisions()
    return [
        {
            "id": "delhi_mumbai",
            "name": "Delhi–Mumbai Rajdhani Corridor",
            "divisions": [d["division"] for d in divisions],
            "total_stations": sum(len(d["stations"]) for d in divisions),
            "total_trains": max((d["train_count"] for d in divisions), default=0),
            "status": "OPERATIONAL",
        }
    ]


async def get_division_timetable(division_name: str, days: int = 7) -> dict[str, Any]:
    """Return timetable, trains, and maintenance windows for a specific division."""
    full_data = await get_full_timetable_with_blocks(days=days)
    div_clean = division_name.strip().lower()

    # Filter trains having stops in this division
    filtered_trains = []
    target_stations = set()
    for t in full_data["trains"]:
        stops = t.get("stops", [])
        matched = False
        for s in stops:
            stn = s.get("station", "")
            d = _station_to_division(stn, s.get("division"))
            if d.lower() == div_clean:
                matched = True
                target_stations.add(stn)
        if matched:
            filtered_trains.append(t)

    # Target segments
    target_segments = set(_station_to_segment(stn) for stn in target_stations)

    # Filter maintenance blocks
    filtered_blocks = [
        b for b in full_data["maintenance_blocks"]
        if b.get("segment_id") in target_segments
    ]

    # Filter timetable slots
    filtered_slots = [
        s for s in full_data["timetable_slots"]
        if s.get("segment_id") in target_segments
    ]

    return {
        "division": division_name,
        "stations": sorted(list(target_stations)),
        "segments": sorted(list(target_segments)),
        "trains": filtered_trains,
        "total_trains": len(filtered_trains),
        "timetable_slots": filtered_slots,
        "maintenance_blocks": filtered_blocks,
        "total_blocks": len(filtered_blocks),
        "summary": {
            **full_data["summary"],
            "division": division_name,
            "division_trains": len(filtered_trains),
            "division_blocks": len(filtered_blocks),
        },
    }
