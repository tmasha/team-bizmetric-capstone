from __future__ import annotations

import json
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
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", "5000"))
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
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
    AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
    IDENTITY_ENDPOINT = os.getenv("IDENTITY_ENDPOINT", "")
    IDENTITY_HEADER = os.getenv("IDENTITY_HEADER", "")
    MSI_ENDPOINT = os.getenv("MSI_ENDPOINT", "")
    MSI_SECRET = os.getenv("MSI_SECRET", "")
    AZURE_OPENAI_SYSTEM_PROMPT = os.getenv(
        "AZURE_OPENAI_SYSTEM_PROMPT",
        (
            "You are the BizMetric secure enterprise assistant. "
            "Only summarize the approved domain-scoped information provided to you. "
            "Do not invent tool output, access, permissions, or data that were not supplied."
        ),
    )
    AZURE_OPENAI_TIMEOUT_SECONDS = float(os.getenv("AZURE_OPENAI_TIMEOUT_SECONDS", "30"))
    MCP_TRANSPORT = os.getenv("MCP_TRANSPORT", "inprocess")
    MCP_TIMEOUT_SECONDS = float(os.getenv("MCP_TIMEOUT_SECONDS", "20"))
    MCP_SHARED_SECRET = os.getenv("MCP_SHARED_SECRET", "")
    MCP_SERVER_CONFIG = json.loads(os.getenv("MCP_SERVER_CONFIG", "{}"))
    MCP_BUSINESS_READ_URL = os.getenv("MCP_BUSINESS_READ_URL", "")
    MCP_SENSITIVE_ACTION_URL = os.getenv("MCP_SENSITIVE_ACTION_URL", "")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    AZURE_MONITOR_CONNECTION_STRING = os.getenv("AZURE_MONITOR_CONNECTION_STRING", "")
    OTEL_SERVICE_NAME = os.getenv("OTEL_SERVICE_NAME", APP_NAME)
    DISABLE_DB_SEED = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    ALLOW_DEV_AUTH = True
