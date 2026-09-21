"""Local filesystem object storage for TrendFlow uploads (no Emergent lock-in)."""
import os
import logging
from pathlib import Path
from typing import Tuple

log = logging.getLogger("storage")

UPLOAD_ROOT = Path(os.environ.get("TRENDFLOW_UPLOAD_DIR", "/tmp/trendflow-uploads"))


def init_storage() -> str:
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    log.info(f"Local storage ready at {UPLOAD_ROOT}")
    return str(UPLOAD_ROOT)


def put_object(path: str, data: bytes, content_type: str) -> dict:
    dest = UPLOAD_ROOT / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return {"path": path, "size": len(data), "content_type": content_type}


def get_object(path: str) -> Tuple[bytes, str]:
    dest = UPLOAD_ROOT / path
    if not dest.exists():
        raise FileNotFoundError(path)
    return dest.read_bytes(), "application/octet-stream"
