"""Per-user API key encryption (Fernet).

Uses TRENDFLOW_KEY_ENCRYPTION_SECRET from the environment.
- Production: secret MUST be set or encrypt/decrypt raises RuntimeError.
- Local smoke: if missing and TRENDFLOW_ALLOW_EPHEMERAL_KEY_SECRET=true,
  a process-local ephemeral key is generated (keys won't survive restart).
"""
from __future__ import annotations

import base64
import hashlib
import logging
import os
from functools import lru_cache
from typing import Optional

log = logging.getLogger("crypto_keys")

_EPHEMERAL: Optional[bytes] = None


def _derive_fernet_key(secret: str) -> bytes:
    digest = hashlib.sha256(secret.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


@lru_cache(maxsize=1)
def _fernet():
    from cryptography.fernet import Fernet

    secret = (os.environ.get("TRENDFLOW_KEY_ENCRYPTION_SECRET") or "").strip()
    if secret:
        return Fernet(_derive_fernet_key(secret))

    allow_ephemeral = os.environ.get("TRENDFLOW_ALLOW_EPHEMERAL_KEY_SECRET", "").lower() in (
        "1", "true", "yes",
    )
    if allow_ephemeral:
        global _EPHEMERAL
        if _EPHEMERAL is None:
            _EPHEMERAL = Fernet.generate_key()
            log.warning(
                "TRENDFLOW_KEY_ENCRYPTION_SECRET missing — using ephemeral Fernet key "
                "(local smoke only; encrypted keys will not survive restart)"
            )
        return Fernet(_EPHEMERAL)

    raise RuntimeError(
        "TRENDFLOW_KEY_ENCRYPTION_SECRET is not set. "
        "Set it in .env (see .env.example) before storing BYOK API keys. "
        "For local smoke only, set TRENDFLOW_ALLOW_EPHEMERAL_KEY_SECRET=true."
    )


def encrypt_key(plaintext: str) -> str:
    if not plaintext or not plaintext.strip():
        raise ValueError("Cannot encrypt empty API key")
    return _fernet().encrypt(plaintext.strip().encode("utf-8")).decode("utf-8")


def decrypt_key(ciphertext: str) -> str:
    if not ciphertext:
        raise ValueError("Cannot decrypt empty ciphertext")
    from cryptography.fernet import InvalidToken

    try:
        return _fernet().decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except InvalidToken as e:
        raise ValueError("Failed to decrypt API key — encryption secret may have changed") from e


def clear_fernet_cache() -> None:
    """Test helper — reset cached Fernet instance."""
    _fernet.cache_clear()
