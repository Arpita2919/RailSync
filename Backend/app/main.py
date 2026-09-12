"""RailSync 2.0 — FastAPI application entry point.

AI-Powered Automatic Block Planning & Digital Twin for Indian Railways.
Layer 4: API Orchestration + Persistence + Explanation + What-If + Feedback
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure workspace root and Backend dir are in sys.path
_backend_dir = Path(__file__).resolve().parent.parent
_workspace_root = _backend_dir.parent
for p in [str(_workspace_root), str(_backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import feedback, health, negotiation, optimization, plans, risk, tasks, timetable
from app.core.config import settings
from app.core.logging import get_logger, setup_logging

log = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    log.info("RailSync 2.0 Layer 4 starting up")

    # Eagerly verify DB connection at startup
    try:
        from app.db.database import check_db_health
        if check_db_health():
            log.info("Database connection verified")
        else:
            log.warning("Database connection failed — endpoints requiring DB will error")
    except Exception as e:
        log.warning("Database not configured: %s", e)

    yield
    log.info("RailSync 2.0 Layer 4 shutting down")


app = FastAPI(
    title="RailSync 2.0 — Layer 4 API",
    description=(
        "AI-Powered Automatic Block Planning & Digital Twin for Indian Railways.\n\n"
        "Orchestrates Layer 1 (Risk/ML), Layer 2 (Negotiation), and Layer 3 (CP-SAT Optimization) "
        "into a unified REST API for the React Dashboard.\n\n"
        "**Prototype Note:** This system uses synthetic/normalized data for demonstration. "
        "It does not have live production TMS/SMMS/TDMS/COA access."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration supporting localhost, Hugging Face Spaces (*.hf.space, *.huggingface.co), Vercel, and custom origins
_origins = settings.cors_origin_list
if "*" in _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_origin_regex=r"https?://.*\.hf\.space|https?://.*\.huggingface\.co|https?://.*\.vercel\.app|https?://localhost(:\d+)?|https?://127\.0\.0\.1(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register routes
app.include_router(health.router)
app.include_router(tasks.router)
app.include_router(risk.router)
app.include_router(negotiation.router)
app.include_router(optimization.router)
app.include_router(plans.router)
app.include_router(feedback.router)
app.include_router(timetable.router)


@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "RailSync 2.0 API Server",
        "version": "2.0.0",
        "docs_url": "/docs",
        "health_check": "/api/v1/health",
        "frontend_dashboard": "http://localhost:5173",
    }
