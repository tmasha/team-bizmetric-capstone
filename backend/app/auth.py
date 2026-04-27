from __future__ import annotations

from dataclasses import dataclass

from flask import current_app, request
from werkzeug.exceptions import Forbidden

from backend.app.policies import resolve_primary_role


@dataclass
class UserContext:
    user_id: str
    email: str
    object_id: str
    roles: list[str]
    primary_role: str
    source: str
    via_apim: bool


def _parse_roles(value: str | None) -> list[str]:
    if not value:
        return ["user"]
    roles = [item.strip() for item in value.split(",") if item.strip()]
    return roles or ["user"]


def load_user_context() -> UserContext:
    secret = request.headers.get("x-apim-shared-secret", "")
    apim_authenticated = request.headers.get("x-apim-authenticated", "").lower() == "true"

    if apim_authenticated:
        expected_secret = current_app.config["APIM_SHARED_SECRET"]
        if secret != expected_secret:
            raise Forbidden("Missing or invalid APIM shared secret.")

        roles = _parse_roles(request.headers.get("x-user-roles"))
        email = request.headers.get("x-user-email", "unknown@bizmetric.local")
        object_id = request.headers.get("x-user-object-id", email)
        user_id = object_id or email
        return UserContext(
            user_id=user_id,
            email=email,
            object_id=object_id,
            roles=roles,
            primary_role=resolve_primary_role(roles),
            source="apim",
            via_apim=True,
        )

    if current_app.config["ALLOW_DEV_AUTH"]:
        roles = _parse_roles(
            request.headers.get("x-debug-user-roles", current_app.config["DEFAULT_DEBUG_ROLE"])
        )
        email = request.headers.get("x-debug-user-email", current_app.config["DEFAULT_DEBUG_EMAIL"])
        user_id = request.headers.get("x-debug-user-id", current_app.config["DEFAULT_DEBUG_USER_ID"])
        object_id = request.headers.get("x-debug-object-id", current_app.config["DEFAULT_DEBUG_OBJECT_ID"])
        return UserContext(
            user_id=user_id,
            email=email,
            object_id=object_id,
            roles=roles,
            primary_role=resolve_primary_role(roles),
            source="dev-bypass",
            via_apim=False,
        )

    raise Forbidden("Direct backend access is not allowed without APIM-authenticated headers.")
