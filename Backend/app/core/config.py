"""RailSync 2.0 — Application configuration via environment variables."""

from __future__ import annotations

from pathlib import Path
from pydantic_settings import BaseSettings

_BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Backend dir
_ROOT_DIR = _BASE_DIR.parent  # Workspace root


class Settings(BaseSettings):
    # Supabase PostgreSQL
    supabase_database_url: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Optional API key for protected endpoints
    api_key: str = ""

    # Logging
    log_level: str = "INFO"

    # "standalone" = built-in adapters, "external" = import real Layer 1/2/3 modules
    layer_mode: str = "standalone"

    model_config = {
        "env_file": [
            str(_ROOT_DIR / ".env"),
            str(_BASE_DIR / ".env"),
            ".env",
            "Backend/.env",
        ],
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
