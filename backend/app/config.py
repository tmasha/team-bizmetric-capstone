from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"


def _as_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    APP_NAME = "BizMetric Secure Control Plane"
    VERSION = "0.1.0"
    ENVIRONMENT = os.getenv("APP_ENV", "development")
    TESTING = False
    DEBUG = ENVIRONMENT == "development"
    DATABASE_PATH = os.getenv("DATABASE_PATH", str(DATA_DIR / "bizmetric.db"))
    ALLOW_DEV_AUTH = _as_bool(
        os.getenv("ALLOW_DEV_AUTH"),
        default=ENVIRONMENT == "development",
    )
    APIM_SHARED_SECRET = os.getenv("APIM_SHARED_SECRET", "local-apim-secret")
    CHAT_PROVIDER = os.getenv("CHAT_PROVIDER", "mock")
    DEFAULT_DEBUG_ROLE = os.getenv("DEFAULT_DEBUG_ROLE", "user")
    DEFAULT_DEBUG_EMAIL = os.getenv("DEFAULT_DEBUG_EMAIL", "demo.user@bizmetric.local")
    DEFAULT_DEBUG_USER_ID = os.getenv("DEFAULT_DEBUG_USER_ID", "demo-user")
    DEFAULT_DEBUG_OBJECT_ID = os.getenv("DEFAULT_DEBUG_OBJECT_ID", "debug-object-id")
    DISABLE_DB_SEED = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    ALLOW_DEV_AUTH = True
