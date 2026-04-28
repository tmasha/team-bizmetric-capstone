from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from flask import current_app

from backend.app.providers.base import ChatProvider


class AzureOpenAIChatProvider(ChatProvider):
    _cached_token: str | None = None
    _cached_token_expires_at: datetime | None = None

    def build_reply(
        self,
        *,
        decision: str,
        requested_tool: str | None,
        tool_results: list[dict],
        policy_reason: str,
        domain: str,
        role: str,
    ) -> str:
        if decision == "blocked":
            return f"Request blocked by policy. {policy_reason}"

        if decision == "review_required":
            return f"This action requires human review before execution. {policy_reason}"

        config = current_app.config
        endpoint = config["AZURE_OPENAI_ENDPOINT"]
        deployment = config["AZURE_OPENAI_DEPLOYMENT"]
        api_version = config["AZURE_OPENAI_API_VERSION"]
        if not endpoint or not deployment:
            raise RuntimeError(
                "Azure OpenAI is selected but AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_DEPLOYMENT is not configured."
            )

        prompt_payload = {
            "decision": decision,
            "domain": domain,
            "role": role,
            "requestedTool": requested_tool,
            "policyReason": policy_reason,
            "toolResults": tool_results,
        }
        messages = [
            {"role": "system", "content": config["AZURE_OPENAI_SYSTEM_PROMPT"]},
            {
                "role": "user",
                "content": (
                    "Respond in plain English with a concise business answer grounded only in this payload. "
                    "If no tool results are present, explain that no privileged tool was needed.\n\n"
                    f"{json.dumps(prompt_payload, indent=2, sort_keys=True)}"
                ),
            },
        ]
        body = {
            "messages": messages,
            "temperature": 0.2,
            "max_completion_tokens": 300,
        }

        request = Request(
            (
                f"{endpoint}/openai/deployments/{quote(deployment)}/chat/completions"
                f"?api-version={quote(api_version)}"
            ),
            data=json.dumps(body).encode("utf-8"),
            headers=self._build_headers(),
            method="POST",
        )

        try:
            with urlopen(request, timeout=config["AZURE_OPENAI_TIMEOUT_SECONDS"]) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Azure OpenAI returned HTTP {error.code}: {detail}") from error
        except URLError as error:
            raise RuntimeError(f"Azure OpenAI endpoint is unreachable: {error.reason}") from error

        choices = payload.get("choices", [])
        if not choices:
            raise RuntimeError("Azure OpenAI returned no completion choices.")

        message = choices[0].get("message", {}).get("content", "")
        if not message.strip():
            raise RuntimeError("Azure OpenAI returned an empty response.")
        return message.strip()

    def _build_headers(self) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        api_key = current_app.config.get("AZURE_OPENAI_API_KEY", "").strip()
        if api_key:
            headers["api-key"] = api_key
            return headers

        token = self._get_bearer_token()
        headers["Authorization"] = f"Bearer {token}"
        return headers

    def _get_bearer_token(self) -> str:
        now = datetime.now(timezone.utc)
        if self._cached_token and self._cached_token_expires_at and now < self._cached_token_expires_at:
            return self._cached_token

        token_data = self._request_managed_identity_token()
        access_token = token_data.get("access_token", "").strip()
        expires_in = int(token_data.get("expires_in", 300))
        if not access_token:
            raise RuntimeError("Managed identity token response did not include an access token.")

        self.__class__._cached_token = access_token
        self.__class__._cached_token_expires_at = now + timedelta(seconds=max(expires_in - 60, 60))
        return access_token

    def _request_managed_identity_token(self) -> dict:
        resource = "https://cognitiveservices.azure.com/"
        identity_endpoint = current_app.config.get("IDENTITY_ENDPOINT") or ""
        identity_header = current_app.config.get("IDENTITY_HEADER") or ""
        if identity_endpoint and identity_header:
            query = urlencode({"resource": resource, "api-version": "2019-08-01"})
            request = Request(
                f"{identity_endpoint}?{query}",
                headers={"X-IDENTITY-HEADER": identity_header, "Metadata": "true"},
                method="GET",
            )
            return self._read_json(request, "managed identity")

        msi_endpoint = current_app.config.get("MSI_ENDPOINT") or ""
        msi_secret = current_app.config.get("MSI_SECRET") or ""
        if msi_endpoint and msi_secret:
            query = urlencode({"resource": resource, "api-version": "2017-09-01"})
            request = Request(
                f"{msi_endpoint}?{query}",
                headers={"secret": msi_secret, "Metadata": "true"},
                method="GET",
            )
            return self._read_json(request, "legacy managed identity")

        raise RuntimeError(
            "Azure OpenAI is missing credentials. Set AZURE_OPENAI_API_KEY or enable App Service managed identity."
        )

    def _read_json(self, request: Request, label: str) -> dict:
        try:
            with urlopen(request, timeout=current_app.config["AZURE_OPENAI_TIMEOUT_SECONDS"]) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"{label} token request failed with HTTP {error.code}: {detail}") from error
        except URLError as error:
            raise RuntimeError(f"{label} token endpoint is unreachable: {error.reason}") from error
