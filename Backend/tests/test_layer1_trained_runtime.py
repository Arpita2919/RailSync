"""RailSync 2.0 — Tests for Live Layer 1 Trained ML Runtime Adapter.

Verifies that Backend/app/integrations/layer1.py loads and outputs actual predictions
from Railsync_Layer1_Complete trained artifacts rather than the old standalone formula.
"""

from __future__ import annotations

import pandas as pd
from pathlib import Path
from app.integrations import layer1, layer3
from app.services import risk_service
from Optimization import MaintenanceTask


def test_trained_layer1_prediction_for_known_segments():
    """Verify that predict_risk returns exact trained values from final_failure_forecasts.csv."""
    # 1. SEG-039 (Trained CRITICAL / High Risk)
    res_39 = layer1.predict_risk({"segment_id": "SEG-039"})
    assert res_39["segment_id"] == "SEG-039"
    assert res_39["division"] == "Agra"
    assert res_39["asset_type"] == "S&T"
    assert res_39["risk_30d"] == 1.0
    assert res_39["confidence"] == "high"
    assert res_39["cold_start_fallback"] is False
    assert res_39["model_version"] == "trained-layer1-v1.0"

    # 2. SEG-002 (Trained High Risk Track)
    res_02 = layer1.predict_risk({"segment_id": "SEG-002"})
    assert res_02["segment_id"] == "SEG-002"
    assert res_02["division"] == "Delhi"
    assert res_02["asset_type"] == "Track"
    assert res_02["risk_30d"] == 1.0

    # 3. SEG-043 (Trained Moderate Risk Track)
    res_43 = layer1.predict_risk({"segment_id": "SEG-043"})
    assert res_43["segment_id"] == "SEG-043"
    assert res_43["division"] == "Agra"
    assert res_43["risk_30d"] == 0.291153


def test_no_standalone_logistic_formula():
    """Verify prediction comes from trained artifacts, not the old formula."""
    # In the old formula, an unknown segment with age 10 would yield logit calculation
    # In the trained adapter, SEG-039 returns risk_30d = 1.0 exactly matching trained ML
    res = layer1.predict_risk({"segment_id": "SEG-039", "age_years": 10})
    assert res["risk_30d"] == 1.0
    assert res["model_version"] == "trained-layer1-v1.0"


def test_survival_curve_is_trained_output():
    """Verify survival curve comes from trained segment_survival_curves.csv."""
    res_39 = layer1.predict_risk({"segment_id": "SEG-039"})
    curve = res_39["survival_curve"]
    assert len(curve) == 30
    assert curve[0]["day"] == 1
    # Day 1 survival probability from trained CSV for SEG-039 is ~0.045693
    assert curve[0]["survival_probability"] < 0.1
    assert curve[-1]["day"] == 30
    assert curve[-1]["survival_probability"] == 0.0


def test_missing_segment_behavior():
    """Verify missing/unseen segment activates cold-start fallback safely."""
    res_unknown = layer1.predict_risk({"segment_id": "SEG-UNSEEN-999", "age_years": 5})
    assert res_unknown["segment_id"] == "SEG-UNSEEN-999"
    assert res_unknown["cold_start_fallback"] is True
    assert res_unknown["confidence"] == "low"
    assert res_unknown["model_version"] == "trained-cold-start-v1.0"
    assert len(res_unknown["survival_curve"]) == 30


def test_batch_predictions():
    """Verify batch predictions return corresponding trained values."""
    batch = layer1.predict_risk_batch([{"segment_id": "SEG-039"}, {"segment_id": "SEG-043"}])
    assert len(batch) == 2
    assert batch[0]["segment_id"] == "SEG-039"
    assert batch[0]["risk_30d"] == 1.0
    assert batch[1]["segment_id"] == "SEG-043"
    assert batch[1]["risk_30d"] == 0.291153


def test_layer1_to_backend_to_layer3():
    """Verify trained Layer 1 output flows through transform_task into MaintenanceTask."""
    trained_pred = layer1.predict_risk({"segment_id": "SEG-039"})
    risk_dict = {"SEG-039": trained_pred}
    task_dict = {"task_id": "TASK-SEG39", "segment_id": "SEG-039", "claimed_criticality": "HIGH"}

    task = layer3.transform_task(task_dict, risk_dict)
    assert isinstance(task, MaintenanceTask)
    assert task.segment == "SEG-039"
    assert task.risk_30d == 1.0
    assert task.expected_downtime_days == trained_pred["expected_downtime_days"]
    assert task.overrun_probability == trained_pred["overrun_probability"]
    assert task.confidence == "high"
    assert task.cold_start_fallback is False
    assert len(task.survival_curve) == 30
