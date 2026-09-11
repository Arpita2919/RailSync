"""RailSync 2.0 — SQLAlchemy engine and session factory for Supabase PostgreSQL."""

from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("db")

_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        if not settings.supabase_database_url:
            raise RuntimeError("SUPABASE_DATABASE_URL is not set")
        _engine = create_engine(
            settings.supabase_database_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            echo=False,
        )
        log.info("Database engine created")
    return _engine


def get_session_factory() -> sessionmaker:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), expire_on_commit=False)
    return _SessionLocal


def get_db() -> Session:
    """FastAPI dependency — yields a DB session, closes on request end."""
    factory = get_session_factory()
    session = factory()
    try:
        yield session
    finally:
        session.close()


def check_db_health() -> bool:
    try:
        with get_session_factory()() as session:
            session.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        log.warning("Database health check failed: %s", exc)
        return False
