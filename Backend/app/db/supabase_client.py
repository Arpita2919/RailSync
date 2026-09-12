"""RailSync 2.0 — Supabase HTTPS REST Client.
=============================================
Direct HTTPS client (port 443) using PostgREST to fetch and sync live real data
(segments, maintenance tasks, risk predictions, block plans, assignments)
from Supabase even in firewall/restricted network environments where raw PostgreSQL
ports 5432/6543 might be filtered.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("supabase.client")


def _get_headers() -> Dict[str, str]:
    key = settings.supabase_service_role_key
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def is_supabase_reachable() -> bool:
    """Check if Supabase HTTPS REST API is reachable."""
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return False
    try:
        url = f"{settings.supabase_url.rstrip('/')}/rest/v1/"
        with httpx.Client(timeout=4.0) as client:
            resp = client.get(url, headers=_get_headers())
            return resp.status_code in (200, 204)
    except Exception as exc:
        log.warning("Supabase HTTPS health check failed: %s", exc)
        return False


def get_remote_segments() -> List[Dict[str, Any]]:
    """Fetch all 50 real corridor segments from Supabase."""
    if not is_supabase_reachable():
        return []
    try:
        url = f"{settings.supabase_url.rstrip('/')}/rest/v1/segments?select=*&order=segment_id.asc"
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(url, headers=_get_headers())
            if resp.status_code == 200:
                data = resp.json()
                log.info("Fetched %d real segments from Supabase", len(data))
                return data
    except Exception as exc:
        log.error("Failed to fetch segments from Supabase: %s", exc)
    return []


def get_remote_tasks(limit: int = 1000) -> List[Dict[str, Any]]:
    """Fetch real maintenance tasks from Supabase."""
    if not is_supabase_reachable():
        return []
    try:
        url = f"{settings.supabase_url.rstrip('/')}/rest/v1/maintenance_tasks?select=*&limit={limit}&order=created_at.desc"
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url, headers=_get_headers())
            if resp.status_code == 200:
                data = resp.json()
                log.info("Fetched %d real tasks from Supabase", len(data))
                return data
    except Exception as exc:
        log.error("Failed to fetch tasks from Supabase: %s", exc)
    return []


def get_remote_plans(limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch persisted master block plans from Supabase."""
    if not is_supabase_reachable():
        return []
    try:
        url = f"{settings.supabase_url.rstrip('/')}/rest/v1/block_plans?select=*&limit={limit}&order=created_at.desc"
        with httpx.Client(timeout=6.0) as client:
            resp = client.get(url, headers=_get_headers())
            if resp.status_code == 200:
                return resp.json()
    except Exception as exc:
        log.error("Failed to fetch plans from Supabase: %s", exc)
    return []


def get_remote_assignments(plan_id: Optional[str] = None, limit: int = 1000) -> List[Dict[str, Any]]:
    """Fetch real block assignments from Supabase."""
    if not is_supabase_reachable():
        return []
    try:
        url = f"{settings.supabase_url.rstrip('/')}/rest/v1/block_assignments?select=*&limit={limit}"
        if plan_id:
            url += f"&plan_id=eq.{plan_id}"
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url, headers=_get_headers())
            if resp.status_code == 200:
                return resp.json()
    except Exception as exc:
        log.error("Failed to fetch assignments from Supabase: %s", exc)
    return []
