"""Video acquisition: yt-dlp for URLs, file fetcher for uploads.

Produces a local mp4 path that's safe to send to Gemini for video understanding.
Caps duration and file size to keep latency and memory predictable.
"""
import os
import uuid
import logging
import subprocess
from typing import Optional

log = logging.getLogger("video")

MAX_DURATION_SEC = 180
MAX_FILE_SIZE_BYTES = 80 * 1024 * 1024
TMP_ROOT = "/tmp/vt_videos"
YTDLP_TIMEOUT_SEC = 120
FFMPEG_TIMEOUT_SEC = 120


def _ensure_dir() -> str:
    os.makedirs(TMP_ROOT, exist_ok=True)
    return TMP_ROOT


def _safe_remove(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass


def _ytdlp_command(out_template: str, url: str) -> list[str]:
    return [
        "yt-dlp",
        "-f", "best[ext=mp4][height<=480]/best[ext=mp4]/best[height<=480]/best",
        "--max-filesize", "80M",
        "--match-filter", f"duration <= {MAX_DURATION_SEC}",
        "--no-playlist",
        "-o", out_template,
        "--no-progress", "--no-warnings", "--quiet",
        url,
    ]


def _run_ytdlp(cmd: list[str], url: str) -> bool:
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=YTDLP_TIMEOUT_SEC)
        if proc.returncode != 0:
            log.warning(f"yt-dlp failed for {url}: rc={proc.returncode} stderr={(proc.stderr or '')[:300]}")
            return False
        return True
    except subprocess.TimeoutExpired:
        log.warning(f"yt-dlp timed out for {url}")
        return False
    except FileNotFoundError:
        log.error("yt-dlp binary not found")
        return False


def _find_output_file(out_id: str) -> Optional[str]:
    for f in os.listdir(TMP_ROOT):
        if f.startswith(out_id + "."):
            return os.path.join(TMP_ROOT, f)
    return None


def _convert_to_mp4(src_path: str, out_id: str) -> Optional[str]:
    mp4_path = os.path.join(TMP_ROOT, f"{out_id}.mp4")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", src_path, "-c:v", "libx264", "-c:a", "aac", "-preset", "ultrafast", mp4_path],
            capture_output=True, timeout=FFMPEG_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired:
        log.warning("ffmpeg conversion timed out")
        return None
    _safe_remove(src_path)
    return mp4_path if os.path.exists(mp4_path) else None


def _finalize_downloaded(path: str, out_id: str) -> Optional[str]:
    """Validate file size; normalize to mp4 if needed."""
    size = os.path.getsize(path)
    if size > MAX_FILE_SIZE_BYTES:
        log.warning(f"Downloaded file too large ({size} bytes), discarding")
        _safe_remove(path)
        return None
    if not path.lower().endswith(".mp4"):
        return _convert_to_mp4(path, out_id)
    return path


def download_via_ytdlp(url: str) -> Optional[str]:
    """Download a video URL and return a local mp4 path, or None on any failure."""
    _ensure_dir()
    out_id = uuid.uuid4().hex
    out_template = os.path.join(TMP_ROOT, f"{out_id}.%(ext)s")
    cmd = _ytdlp_command(out_template, url)
    if not _run_ytdlp(cmd, url):
        return None
    raw_path = _find_output_file(out_id)
    if not raw_path:
        return None
    return _finalize_downloaded(raw_path, out_id)


def save_bytes_to_tmp(data: bytes, ext: str = "mp4") -> str:
    _ensure_dir()
    fname = f"{uuid.uuid4().hex}.{ext.lstrip('.')}"
    path = os.path.join(TMP_ROOT, fname)
    with open(path, "wb") as f:
        f.write(data)
    return path


def probe_duration(path: str) -> Optional[int]:
    """Get duration in seconds using ffprobe; returns None on failure."""
    try:
        proc = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", path],
            capture_output=True, text=True, timeout=15,
        )
        if proc.returncode == 0:
            return int(float(proc.stdout.strip()))
    except (subprocess.TimeoutExpired, ValueError):
        pass
    return None


def cleanup(path: Optional[str]) -> None:
    if path:
        _safe_remove(path)
