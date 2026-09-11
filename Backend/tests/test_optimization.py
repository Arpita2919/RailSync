"""Tests for Layer 3 optimization and what-if endpoints."""

from __future__ import annotations


def test_optimize_and_whatif_endpoints(client):
    # Ingest task
    client.post("/ingest/tasks", json={
        "task_id": "TASK-OPT-01",
        "segment_id": "SEG-TEST-001",
        "department": "TRACK",
        "task_type": "Rail Weld Repair",
        "claimed_criticality": 4,
        "min_duration_hrs": 2.0,
    })

    # Run optimization
    opt_payload = {
        "horizon": "weekly",
        "policy": "balanced",
    }
    opt_resp = client.post("/optimize", json=opt_payload)
    assert opt_resp.status_code == 200
    opt_data = opt_resp.json()
    assert "run_id" in opt_data
    assert "weekly_plan" in opt_data
    assert "assignments" in opt_data
    assert "objective_values" in opt_data
    assert "robustness_score" in opt_data
    assert opt_data["feasible"] is True

    # Test what-if analysis
    whatif_payload = {
        "type": "unplanned_failure",
        "segment_id": "SEG-TEST-001",
        "severity": "high",
        "description": "Emergency track fracture",
    }
    whatif_resp = client.post("/optimize/whatif", json=whatif_payload)
    assert whatif_resp.status_code == 200
    whatif_data = whatif_resp.json()
    assert "run_id" in whatif_data
    assert "plan_b" in whatif_data
    assert "changed_assignments" in whatif_data
    assert whatif_data["feasible"] is True
