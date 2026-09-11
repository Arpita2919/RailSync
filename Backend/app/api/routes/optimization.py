"""RailSync 2.0 — Optimization and what-if endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.optimization import (
    OptimizeRequest,
    OptimizeResponse,
    WhatIfRequest,
    WhatIfResponse,
)
from app.services import optimization_service, whatif_service

router = APIRouter(tags=["Optimization"])


@router.post("/optimize", response_model=OptimizeResponse)
def optimize(request: OptimizeRequest, db: Session = Depends(get_db)):
    try:
        result = optimization_service.run_optimization(
            db=db,
            policy=request.policy,
            horizon=request.horizon,
            objective_weights=request.objective_weights,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed: {type(e).__name__}",
        )

    if not result.feasible:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "status": result.status,
                "reason": result.error_message,
                "affected_tasks": result.affected_tasks,
            },
        )

    return result


@router.post("/optimize/whatif", response_model=WhatIfResponse)
def whatif(request: WhatIfRequest, db: Session = Depends(get_db)):
    try:
        return whatif_service.run_whatif(db, request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"What-if simulation failed: {type(e).__name__}: {str(e)}",
        )


@router.get("/optimize/weekly")
@router.post("/optimize/weekly")
def weekly_plan(policy: str = "balanced", db: Session = Depends(get_db)):
    try:
        return optimization_service.run_weekly_planning(db=db, policy=policy)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weekly plan generation failed: {type(e).__name__}: {str(e)}",
        )


@router.get("/optimize/monthly")
@router.post("/optimize/monthly")
def monthly_plan(policy: str = "balanced", db: Session = Depends(get_db)):
    try:
        return optimization_service.run_monthly_planning(db=db, policy=policy)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Monthly plan generation failed: {type(e).__name__}: {str(e)}",
        )


@router.get("/optimize/pareto")
def pareto_frontier(db: Session = Depends(get_db)):
    try:
        return optimization_service.run_pareto(db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pareto frontier calculation failed: {type(e).__name__}: {str(e)}",
        )


@router.get("/optimize/robustness")
def scenario_robustness(num_scenarios: int = 50, db: Session = Depends(get_db)):
    try:
        return optimization_service.run_robustness(db=db, num_scenarios=num_scenarios)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scenario robustness evaluation failed: {type(e).__name__}: {str(e)}",
        )


@router.get("/optimize/plan-b")
def plan_b_contingencies(db: Session = Depends(get_db)):
    try:
        return optimization_service.run_plan_b(db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plan B contingencies generation failed: {type(e).__name__}: {str(e)}",
        )

