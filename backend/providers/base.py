"""Provider protocols for TrendFlow BYOK."""
from __future__ import annotations

from typing import Any, Dict, Optional, Protocol, runtime_checkable


class ProviderAuthError(Exception):
    """API key rejected / unauthorized."""


class ProviderQuotaError(Exception):
    """Quota / rate / billing exhausted."""


@runtime_checkable
class PerceptionProvider(Protocol):
    """Vision / perception slot (e.g. Gemini)."""

    provider_id: str
    default_model: str

    async def perceive(
        self,
        *,
        api_key: str,
        model: str,
        system: str,
        user_text: str,
        video_path: Optional[str] = None,
    ) -> str:
        ...


@runtime_checkable
class ReasonProvider(Protocol):
    """Reasoning / scorecard / scripts slot (e.g. Claude, Grok)."""

    provider_id: str
    default_model: str

    async def complete(
        self,
        *,
        api_key: str,
        model: str,
        system: str,
        user_text: str,
        max_tokens: int = 8192,
    ) -> str:
        ...


# Catalog for UI (public, no secrets)
PERCEPTION_PROVIDERS = [
    {
        "id": "gemini",
        "label": "Google Gemini",
        "recommended": True,
        "models": [
            {"id": "gemini-2.0-flash", "label": "Gemini 2.0 Flash", "recommended": True},
            {"id": "gemini-2.5-flash", "label": "Gemini 2.5 Flash", "recommended": False},
            {"id": "gemini-1.5-pro", "label": "Gemini 1.5 Pro", "recommended": False},
        ],
    },
]

REASON_PROVIDERS = [
    {
        "id": "anthropic",
        "label": "Anthropic Claude",
        "recommended": True,
        "models": [
            {"id": "claude-sonnet-4-20250514", "label": "Claude Sonnet 4", "recommended": True},
            {"id": "claude-3-5-sonnet-20241022", "label": "Claude 3.5 Sonnet", "recommended": False},
            {"id": "claude-3-5-haiku-20241022", "label": "Claude 3.5 Haiku", "recommended": False},
        ],
    },
    {
        "id": "xai",
        "label": "xAI Grok",
        "recommended": True,
        "models": [
            {"id": "grok-2-latest", "label": "Grok 2", "recommended": True},
            {"id": "grok-3-mini", "label": "Grok 3 Mini", "recommended": False},
        ],
    },
]

DEFAULTS = {
    "perception_provider": "gemini",
    "perception_model": "gemini-2.0-flash",
    "reason_provider": "anthropic",
    "reason_model": "claude-sonnet-4-20250514",
}
