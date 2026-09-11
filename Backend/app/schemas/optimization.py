"""RailSync 2.0 — Optimization and what-if schemas (Layer 3 contract)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

VALID_POLICIES = {"safety_first", "balanced", "throughput_first"}
VALID_HORIZONS = {"weekly", "monthly", "both"}


class OptimizeRequest(BaseModel):
    policy: str = Field(default="balanced")
    horizon: str = Field(default="both")
    objective_weights: Optional[dict[str, float]] = None

    @field_validator("policy")
    @classmethod
    def validate_policy(cls, v):
        if v not in VALID_POLICIES:
            raise ValueError(f"policy must be one of {VALID_POLICIES}")
        return v

    @field_validator("horizon")
    @classmethod
    def validate_horizon(cls, v):
        if v not in VALID_HORIZONS:
            raise ValueError(f"horizon must be one of {VALID_HORIZONS}")
        return v


class WhatIfRequest(BaseModel):
    type: str = Field(..., min_length=1)
    segment_id: str = Field(..., min_length=1)
    time: Optional[str] = None
    severity: str = Field(default="moderate")
    description: Optional[str] = None


class AssignmentOut(BaseModel):
    id: Optional[int] = None
    task_id: str
    segment_id: str
    department: str
    block_start: datetime
    block_end: datetime
    duration_hrs: float
    priority: Optional[float] = None
    risk_30d: Optional[float] = None
    reason: Optional[str] = None
    explanation: Optional[dict[str, Any]] = None
    consolidation_group: Optional[str] = None

    model_config = {"from_attributes": True}


class OptimizeResponse(BaseModel):
    run_id: str
    policy: str
    horizon: str
    status: str
    feasible: bool
    execution_time_ms: int
    weekly_plan: Optional[dict[str, Any]] = None
    monthly_plan: Optional[dict[str, Any]] = None
    assignments: list[AssignmentOut] = []
    objective_values: Optional[dict[str, float]] = None
    robustness_score: Optional[float] = None
    total_assignments: int = 0
    error_message: Optional[str] = None
    affected_tasks: list[str] = []


class PlanDiff(BaseModel):
    task_id: str
    change_type: str  # added, removed, moved, modified
    old_start: Optional[datetime] = None
    old_end: Optional[datetime] = None
    new_start: Optional[datetime] = None
    new_end: Optional[datetime] = None
    reason: str = ""


class WhatIfResponse(BaseModel):
    feasible: bool
    run_id: str
    plan_b: Optional[dict[str, Any]] = None
    changed_assignments: list[PlanDiff] = []
    added_assignments: list[AssignmentOut] = []
    removed_assignments: list[AssignmentOut] = []
    reason: list[str] = []
    execution_time_ms: int = 0
    objective_values: Optional[dict[str, float]] = None
