from __future__ import annotations

from backend.app.providers.azure_openai import AzureOpenAIChatProvider
from backend.app.providers.mock import MockChatProvider


def get_chat_provider(name: str):
    if name == "azure_openai":
        return AzureOpenAIChatProvider()
    return MockChatProvider()
