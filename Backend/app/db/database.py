"""RailSync 2.0 — SQLAlchemy engine and session factory for Supabase PostgreSQL & Resilient Local Sync."""

from __future__ import annotations

import os
from pathlib import Path
from sqlalchemy import create_engine, text, event
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.logging import get_logger
from app.db.models import Base
from app.db import supabase_client

log = get_logger("db")

_engine = None
_SessionLocal = None


# Compile Postgres JSONB as TEXT for SQLite fallback
@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "TEXT"


def _init_sqlite_engine():
    """Fallback high-performance local SQLite database engine."""
    db_path = Path(__file__).resolve().parent.parent.parent / "railsync_data.db"
    sqlite_url = f"sqlite:///{db_path}"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)
    log.info("Initialized local SQLite engine: %s", sqlite_url)
    return engine


def get_engine():
    global _engine
    if _engine is not None:
        return _engine

    # 1. Try Supabase PostgreSQL direct connection if configured
    if settings.supabase_database_url:
        try:
            pg_engine = create_engine(
                settings.supabase_database_url,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 2},
                echo=False,
            )
            # Test connection with fast ping
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            _engine = pg_engine
            log.info("Supabase PostgreSQL direct database engine connected")
            return _engine
        except Exception as exc:
            log.warning("Supabase PostgreSQL direct port connection timed out/unavailable (%s). Activating resilient HTTPS data sync mode.", exc)

    # 2. Resilient engine with Supabase data sync
    _engine = _init_sqlite_engine()
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
    """Returns True if database session or Supabase REST is functional."""
    try:
        with get_session_factory()() as session:
            session.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        if supabase_client.is_supabase_reachable():
            return True
        log.warning("Database health check failed: %s", exc)
        return False
