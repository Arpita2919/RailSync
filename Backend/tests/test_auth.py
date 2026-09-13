"""Tests for FastAPI Supabase Authentication & Authorization Middleware."""

from fastapi.testclient import TestClient
import pytest

from app.db.database import get_db
from app.main import app


def test_public_health_endpoint_unauthenticated(db_session):
    """Public health endpoint should be accessible without Authorization header."""
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        with TestClient(app) as client:
            resp = client.get("/health")
            assert resp.status_code == 200
            assert resp.json()["status"] in ("ok", "healthy", "degraded")
    finally:
        app.dependency_overrides.clear()


def test_protected_endpoint_rejects_missing_token(db_session):
    """Protected endpoints should reject requests missing an Authorization header with HTTP 401."""
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        with TestClient(app) as client:
            resp = client.get("/tasks")
            assert resp.status_code == 401
            assert "detail" in resp.json()
    finally:
        app.dependency_overrides.clear()


def test_protected_endpoint_accepts_valid_bearer_token(db_session):
    """Protected endpoints should accept requests containing a valid Bearer token."""
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        with TestClient(app) as client:
            headers = {"Authorization": "Bearer demo_token_123456789"}
            resp = client.get("/tasks", headers=headers)
            assert resp.status_code == 200
    finally:
        app.dependency_overrides.clear()
