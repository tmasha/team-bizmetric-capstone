from __future__ import annotations

import re
from copy import deepcopy


REDACTED = "[REDACTED]"
SENSITIVE_KEYS = {"token", "secret", "password", "ssn", "access_key"}
EMAIL_PATTERN = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")


def redact_value(value):
    if isinstance(value, dict):
        return {
            key: (REDACTED if key.lower() in SENSITIVE_KEYS else redact_value(item))
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [redact_value(item) for item in value]
    if isinstance(value, str):
        return EMAIL_PATTERN.sub(REDACTED, value)
    return deepcopy(value)


def build_excerpt(text: str, limit: int = 120) -> str:
    if len(text) <= limit:
        return text
    return f"{text[: limit - 3]}..."
