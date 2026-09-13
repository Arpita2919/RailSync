"""Tests for Multi-Division and Railway Schedule API scaling."""

import pytest
from fastapi.testclient import TestClient


def test_list_divisions_endpoint(client: TestClient):
    """Test GET /timetable/divisions returns all API-supported railway divisions."""
    response = client.get("/timetable/divisions")
    assert response.status_code == 200
    data = response.json()
    assert "divisions" in data
    assert data["total_divisions"] >= 5

    div_names = [d["division"] for d in data["divisions"]]
    assert "Delhi" in div_names
    assert "Kota" in div_names
    assert "Ratlam" in div_names
    assert "Vadodara" in div_names
    assert "Mumbai" in div_names


def test_list_corridors_endpoint(client: TestClient):
    """Test GET /timetable/corridors returns corridor structure."""
    response = client.get("/timetable/corridors")
    assert response.status_code == 200
    data = response.json()
    assert "corridors" in data
    assert len(data["corridors"]) > 0
    assert "Delhi" in data["corridors"][0]["divisions"]


def test_division_timetable_endpoint(client: TestClient):
    """Test GET /timetable/divisions/{division}/timetable filters schedule correctly."""
    response = client.get("/timetable/divisions/Vadodara/timetable")
    assert response.status_code == 200
    data = response.json()
    assert data["division"] == "Vadodara"
    assert "trains" in data
    assert len(data["trains"]) > 0
    assert "maintenance_blocks" in data
    assert "ST" in data["stations"] or "BRC" in data["stations"]


def test_api_v1_router_aliases(client: TestClient):
    """Test /api/v1/ aliases work identically."""
    r1 = client.get("/api/v1/divisions")
    assert r1.status_code == 200
    assert r1.json()["total_divisions"] >= 5

    r2 = client.get("/api/v1/corridors")
    assert r2.status_code == 200
