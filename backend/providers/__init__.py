"""BYOK provider adapters — perception (vision) + reason (LLM).

Scaffold: protocols + thin adapters. Live Study/Test still routes through llm.py
which resolves per-user keys and calls provider SDKs.
"""
from .base import PerceptionProvider, ReasonProvider, ProviderAuthError, ProviderQuotaError

__all__ = [
    "PerceptionProvider",
    "ReasonProvider",
    "ProviderAuthError",
    "ProviderQuotaError",
]
