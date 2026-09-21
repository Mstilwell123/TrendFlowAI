"""TrendFlowAI — FastAPI backend (Runtime A)."""
import os
import logging
import secrets
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from models import (
    UserDoc, SignupBody, LoginBody, TokenResponse, ProfileBody,
    AiConfigPutBody, AnalyzeBody, AnalysisDoc, RateScriptBody, OutcomeBody, OutcomeDoc,
    NICHES, COMPONENTS, TIERS, TOPUPS, _now_iso, _uuid,
)
import crypto_keys
from providers.base import PERCEPTION_PROVIDERS, REASON_PROVIDERS, DEFAULTS as AI_DEFAULTS
from auth import hash_password, verify_password, create_token, CurrentUserId
import llm
import storage
import video as video_mod
from trends_seed import TIKTOK_PULSE, TIKTOK_CLUSTERS, YOUTUBE_PULSE, YOUTUBE_CLUSTERS, PLATFORM_STUBS, AS_OF as TRENDS_AS_OF

# In-memory trend store (Phase 1 seed; Supabase tables in supabase/migrations)
_TREND_PULSES = {"tiktok": TIKTOK_PULSE, "youtube": YOUTUBE_PULSE}
_TREND_CLUSTERS = {"tiktok": list(TIKTOK_CLUSTERS), "youtube": list(YOUTUBE_CLUSTERS)}

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("server")

# Mongo
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
users_col = db["tf_users"]
analyses_col = db["tf_analyses"]
ratings_col = db["tf_script_ratings"]
outcomes_col = db["tf_outcomes"]
vault_col = db["tf_vault"]
uploads_col = db["tf_uploads"]

app = FastAPI(title="TrendFlowAI")
api = APIRouter(prefix="/api")


def _user_public(u: dict) -> dict:
    if not u:
        return {}
    ai = llm.public_ai_config(u)
    return {
        "id": u["id"], "email": u["email"], "name": u.get("name", ""),
        "niche": u.get("niche"), "brand_voice": u.get("brand_voice"),
        "subscription_tier": u.get("subscription_tier", "free"),
        "onboarded": u.get("onboarded", False),
        "has_ai_keys": bool(ai.get("has_perception_key") and ai.get("has_reason_key")),
        "ai_config": ai,  # public only — never raw keys
        "created_at": u.get("created_at"),
    }


def _analysis_public(a: dict) -> dict:
    scorecard = a.get("scorecard") or {}
    return {
        "id": a["id"], "user_id": a["user_id"], "mode": a["mode"], "status": a["status"],
        "progress": a.get("progress", 0), "error": a.get("error"),
        "video_url": a.get("video_url"), "upload_id": a.get("upload_id"),
        "platform": a.get("platform"),
        "post_id": a.get("post_id"),
        "title": a.get("title"), "description": a.get("description"),
        "duration_sec": a.get("duration_sec"),
        "outlier_multiplier": a.get("outlier_multiplier", 1.0),
        "niche": a.get("niche"),
        "perception": a.get("perception"), "scorecard": a.get("scorecard"),
        "scripts": a.get("scripts", []), "alignment": a.get("alignment"),
        "detected_angle": a.get("detected_angle") or scorecard.get("detected_angle"),
        "trend_comparison": a.get("trend_comparison"),
        "overall_score": a.get("overall_score", scorecard.get("composite")),
        "band": a.get("band") or scorecard.get("band"),
        "shared_slug": a.get("shared_slug"), "shared_at": a.get("shared_at"),
        "sent_to_swarm_command": a.get("sent_to_swarm_command", False),
        "created_at": a.get("created_at"), "updated_at": a.get("updated_at"),
        "as_of": a.get("as_of"),
    }


def _analysis_public_view(a: dict) -> dict:
    """Redacted public-facing view of an analysis. No user-identifying fields, no internal flags."""
    perception = a.get("perception") or {}
    return {
        "id": a["id"],
        "mode": a["mode"],
        "title": a.get("title"),
        "video_url": a.get("video_url"),
        "platform": a.get("platform"),
        "duration_sec": a.get("duration_sec"),
        "niche": a.get("niche"),
        "outlier_multiplier": a.get("outlier_multiplier", 1.0),
        "perception": {"summary": perception.get("summary")},
        "scorecard": a.get("scorecard"),
        "scripts": a.get("scripts", []),
        "alignment": a.get("alignment"),
        "shared_at": a.get("shared_at"),
        "created_at": a.get("created_at"),
    }


async def _update_analysis(analysis_id: str, **fields):
    fields["updated_at"] = _now_iso()
    await analyses_col.update_one({"id": analysis_id}, {"$set": fields})


async def _acquire_video(a: dict, user_id: str, analysis_id: str) -> tuple[Optional[str], bool]:
    """Resolve the analysis to a local video file path, if possible.

    Returns (local_path, should_cleanup). `local_path=None` means we have no video file
    and the pipeline should fall back to metadata-heuristic perception.
    """
    if a.get("upload_id"):
        up = await uploads_col.find_one(
            {"id": a["upload_id"], "user_id": user_id, "is_deleted": False}, {"_id": 0},
        )
        if not up:
            return None, False
        try:
            data, _ = storage.get_object(up["storage_path"])
            local_path = video_mod.save_bytes_to_tmp(data, ext=up.get("ext") or "mp4")
            probed = video_mod.probe_duration(local_path)
            if probed:
                await _update_analysis(analysis_id, duration_sec=probed)
            return local_path, True
        except Exception as e:
            log.warning(f"Upload fetch failed for analysis {analysis_id}: {e}")
            return None, False

    if a.get("video_url"):
        await _update_analysis(analysis_id, status="downloading", progress=10)
        local_path = video_mod.download_via_ytdlp(a["video_url"])
        if not local_path:
            log.info(f"yt-dlp could not fetch {a['video_url']}, using metadata heuristic")
            return None, False
        probed = video_mod.probe_duration(local_path)
        if probed:
            await _update_analysis(analysis_id, duration_sec=probed)
        log.info(f"Downloaded video for analysis {analysis_id}: {local_path}")
        return local_path, True

    return None, False


async def _run_perception_stage(analysis_id: str, a: dict, niche: str, video_path: Optional[str],
                                creds) -> dict:
    await _update_analysis(analysis_id, status="perceiving", progress=25)
    perception = await llm.run_perception(
        a.get("video_url"), a.get("title"), a.get("description"),
        a.get("platform"), niche, a.get("duration_sec"),
        video_path=video_path,
        creds=creds,
    )
    await _update_analysis(
        analysis_id, perception=perception, progress=45,
        duration_sec=perception.get("duration_sec") or a.get("duration_sec"),
    )
    return perception


async def _run_scorecard_stage(analysis_id: str, perception: dict, niche: str, creds, platform: str = "tiktok") -> dict:
    await _update_analysis(analysis_id, status="analyzing", progress=60)
    scorecard = await llm.run_scorecard(perception, niche, creds=creds, platform=platform)
    await _update_analysis(analysis_id, scorecard=scorecard, progress=75)
    return scorecard


async def _run_study_outputs(analysis_id: str, a: dict, user_id: str, niche: str,
                             perception: dict, scorecard: dict, brand_voice: dict, creds):
    await _update_analysis(analysis_id, status="generating", progress=82)
    scripts = await llm.run_scripts(perception, scorecard, niche, brand_voice, creds=creds)
    await _update_analysis(analysis_id, scripts=scripts, progress=98)
    await vault_col.insert_one({
        "id": _uuid(), "user_id": user_id, "analysis_id": analysis_id,
        "niche": niche, "title": a.get("title") or "Untitled",
        "video_url": a.get("video_url"),
        "summary": (scorecard or {}).get("summary", ""),
        "composite": (scorecard or {}).get("composite", 0),
        "created_at": _now_iso(),
    })


async def _run_test_outputs(analysis_id: str, perception: dict, scorecard: dict, creds):
    await _update_analysis(analysis_id, status="generating", progress=85)
    alignment = await llm.run_alignment(perception, scorecard, creds=creds)
    await _update_analysis(analysis_id, alignment=alignment, progress=98)


async def run_pipeline(analysis_id: str, user_id: str):
    local_video_path: Optional[str] = None
    cleanup_local = False
    try:
        a = await analyses_col.find_one({"id": analysis_id}, {"_id": 0})
        if not a:
            return
        u = await users_col.find_one({"id": user_id}, {"_id": 0}) or {}
        niche = a.get("niche") or u.get("niche") or "general"
        brand_voice = u.get("brand_voice") or {"tone": "confident, conversational"}

        # BYOK: resolve per-user keys (or local-only shared escape hatch)
        try:
            creds = llm.resolve_credentials(u)
        except llm.MissingUserKeysError as e:
            await _update_analysis(analysis_id, status="failed", error=str(e))
            return

        local_video_path, cleanup_local = await _acquire_video(a, user_id, analysis_id)
        perception = await _run_perception_stage(analysis_id, a, niche, local_video_path, creds)
        platform = (a.get("platform") or "tiktok").lower()
        if platform in ("upload", "web"):
            platform = "tiktok"
        scorecard = await _run_scorecard_stage(analysis_id, perception, niche, creds, platform=platform)

        clusters = _TREND_CLUSTERS.get(platform) or _TREND_CLUSTERS.get("tiktok", [])
        trend_comparison = await llm.run_trend_comparison(scorecard, clusters, niche, creds=creds)
        detected_angle = scorecard.get("detected_angle")
        overall = scorecard.get("composite")
        band = scorecard.get("band")
        await _update_analysis(
            analysis_id,
            detected_angle=detected_angle,
            trend_comparison=trend_comparison,
            overall_score=overall,
            band=band,
            as_of=trend_comparison.get("as_of") or TRENDS_AS_OF,
            progress=80,
        )

        if a["mode"] == "study":
            await _run_study_outputs(analysis_id, a, user_id, niche, perception, scorecard, brand_voice, creds)
        else:
            await _run_test_outputs(analysis_id, perception, scorecard, creds)

        await _update_analysis(analysis_id, status="done", progress=100, error=None)
        log.info(
            f"Analysis {analysis_id} done (perception_source={perception.get('_source')}, "
            f"key_source={creds.source})"
        )
    except llm.UserProviderError as e:
        log.warning(f"Pipeline provider key/quota failure for {analysis_id}: {e}")
        await _update_analysis(analysis_id, status="failed", error=str(e))
    except llm.MissingUserKeysError as e:
        await _update_analysis(analysis_id, status="failed", error=str(e))
    except Exception as e:
        log.exception(f"Pipeline failed for {analysis_id}: {e}")
        # Never leak shared-key / internal billing into the user-facing error
        msg = str(e)
        low = msg.lower()
        if any(x in low for x in ("api key", "quota", "401", "403", "429", "billing", "rate limit")):
            msg = llm.USER_FRIENDLY_KEY_ERROR
        await _update_analysis(analysis_id, status="failed", error=msg[:500])
    finally:
        if cleanup_local:
            video_mod.cleanup(local_video_path)


# ---------- Auth ----------
@api.post("/auth/signup", response_model=TokenResponse)
async def signup(body: SignupBody):
    if await users_col.find_one({"email": body.email.lower()}, {"_id": 0}):
        raise HTTPException(409, "Email already registered")
    user = UserDoc(
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        name=body.name.strip(),
    )
    await users_col.insert_one(user.model_dump())
    token = create_token(user.id, user.email)
    return {"token": token, "user": _user_public(user.model_dump())}


@api.post("/auth/login", response_model=TokenResponse)
async def login(body: LoginBody):
    u = await users_col.find_one({"email": body.email.lower()}, {"_id": 0})
    if not u or not verify_password(body.password, u["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(u["id"], u["email"])
    return {"token": token, "user": _user_public(u)}


@api.get("/auth/me")
async def me(user_id: str = CurrentUserId):
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    if not u:
        raise HTTPException(404, "User not found")
    return _user_public(u)


# ---------- Profile ----------
@api.post("/profile")
async def upsert_profile(body: ProfileBody, user_id: str = CurrentUserId):
    """Save niche + brand voice. Does NOT set onboarded unless complete_onboarding
    is True AND the user already has both AI keys saved.
    """
    if body.niche not in NICHES:
        raise HTTPException(400, "Invalid niche")
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    if not u:
        raise HTTPException(404, "User not found")

    updates: Dict[str, Any] = {"niche": body.niche, "brand_voice": body.brand_voice}

    if body.complete_onboarding:
        if not llm.user_has_ai_keys(u):
            raise HTTPException(
                400,
                "Connect your AI keys before completing onboarding",
            )
        updates["onboarded"] = True

    await users_col.update_one({"id": user_id}, {"$set": updates})
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    return _user_public(u)


# ---------- BYOK AI config ----------
@api.get("/ai-config")
async def get_ai_config(user_id: str = CurrentUserId):
    """Public AI config (providers/models + has_*_key flags). Never returns raw keys."""
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    if not u:
        raise HTTPException(404, "User not found")
    return {
        **llm.public_ai_config(u),
        "catalog": {
            "perception_providers": PERCEPTION_PROVIDERS,
            "reason_providers": REASON_PROVIDERS,
            "defaults": AI_DEFAULTS,
        },
    }


@api.put("/ai-config")
async def put_ai_config(body: AiConfigPutBody, user_id: str = CurrentUserId):
    """Set providers/models and optionally rotate encrypted API keys."""
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    if not u:
        raise HTTPException(404, "User not found")

    cfg = dict(u.get("ai_config") or {})
    cfg["perception_provider"] = body.perception_provider
    cfg["perception_model"] = body.perception_model
    cfg["reason_provider"] = body.reason_provider
    cfg["reason_model"] = body.reason_model

    try:
        if body.perception_api_key and body.perception_api_key.strip():
            cfg["perception_key_enc"] = crypto_keys.encrypt_key(body.perception_api_key)
        if body.reason_api_key and body.reason_api_key.strip():
            cfg["reason_key_enc"] = crypto_keys.encrypt_key(body.reason_api_key)
    except RuntimeError as e:
        raise HTTPException(500, str(e)) from e
    except ValueError as e:
        raise HTTPException(400, str(e)) from e

    await users_col.update_one({"id": user_id}, {"$set": {"ai_config": cfg}})
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    return llm.public_ai_config(u)


@api.post("/onboarding/complete")
async def complete_onboarding(user_id: str = CurrentUserId):
    """Mark onboarded=true only after AI keys are present (step 3)."""
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    if not u:
        raise HTTPException(404, "User not found")
    if not u.get("niche"):
        raise HTTPException(400, "Set your niche before completing onboarding")
    if not u.get("brand_voice"):
        raise HTTPException(400, "Set your brand voice before completing onboarding")
    if not llm.user_has_ai_keys(u):
        raise HTTPException(400, "Connect your AI keys before completing onboarding")
    await users_col.update_one({"id": user_id}, {"$set": {"onboarded": True}})
    u = await users_col.find_one({"id": user_id}, {"_id": 0})
    return _user_public(u)


# ---------- Reference data ----------
@api.get("/reference/niches")
async def list_niches():
    return {"niches": NICHES}


@api.get("/reference/components")
async def list_components():
    return {"components": COMPONENTS}


@api.get("/reference/tiers")
async def list_tiers():
    return {"tiers": TIERS, "topups": TOPUPS}


def _infer_platform(url: Optional[str]) -> Optional[str]:
    if not url:
        return "upload"
    u = url.lower()
    if "tiktok" in u:
        return "tiktok"
    if "youtube" in u or "youtu.be" in u:
        return "youtube"
    if "instagram" in u or "reels" in u:
        return "reels"
    return "web"


def _title_from_url(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    try:
        seg = url.rstrip("/").split("/")[-1]
        return seg[:80] if seg else None
    except Exception:
        return None


MAX_UPLOAD_SIZE = 80 * 1024 * 1024


def _validate_upload(file: UploadFile, data: bytes) -> None:
    ct = (file.content_type or "").lower()
    if not (ct.startswith("video/") or ct == "application/octet-stream"):
        raise HTTPException(415, f"Unsupported file type: {file.content_type}")
    size = len(data)
    if size == 0:
        raise HTTPException(400, "Empty file")
    if size > MAX_UPLOAD_SIZE:
        raise HTTPException(413, "File too large (max 80MB)")


def _upload_extension(file: UploadFile) -> str:
    if file.filename and "." in file.filename:
        return file.filename.rsplit(".", 1)[-1].lower()[:5]
    return "mp4"


def _persist_to_storage(storage_path: str, data: bytes, content_type: Optional[str]) -> None:
    try:
        storage.put_object(storage_path, data, content_type or "video/mp4")
    except Exception as e:
        log.exception(f"Storage upload failed: {e}")
        raise HTTPException(502, "Storage upload failed")


# ---------- Analyze ----------
@api.post("/uploads")
async def upload_video(file: UploadFile = File(...), user_id: str = CurrentUserId):
    data = await file.read()
    _validate_upload(file, data)

    ext = _upload_extension(file)
    upload_id = _uuid()
    storage_path = f"trendflow/uploads/{user_id}/{upload_id}.{ext}"
    _persist_to_storage(storage_path, data, file.content_type)

    doc = {
        "id": upload_id, "user_id": user_id,
        "storage_path": storage_path,
        "original_filename": file.filename or f"upload.{ext}",
        "content_type": file.content_type or "video/mp4",
        "ext": ext, "size": len(data),
        "is_deleted": False,
        "created_at": _now_iso(),
    }
    await uploads_col.insert_one(doc)
    return {"id": upload_id, "size": len(data), "filename": doc["original_filename"]}


@api.post("/analyze")
async def analyze(body: AnalyzeBody, bg: BackgroundTasks, user_id: str = CurrentUserId):
    if body.mode == "study" and not body.video_url:
        raise HTTPException(400, "study mode requires video_url")

    upload_doc = None
    if body.upload_id:
        upload_doc = await uploads_col.find_one(
            {"id": body.upload_id, "user_id": user_id, "is_deleted": False}, {"_id": 0}
        )
        if not upload_doc:
            raise HTTPException(404, "Upload not found")

    u = await users_col.find_one({"id": user_id}, {"_id": 0}) or {}

    # BYOK gate: Study/Test require user keys (or local-only shared escape hatch)
    try:
        llm.resolve_credentials(u)
    except llm.MissingUserKeysError as e:
        raise HTTPException(status_code=402, detail=str(e)) from e

    doc = AnalysisDoc(
        user_id=user_id, mode=body.mode,
        video_url=body.video_url,
        upload_id=body.upload_id,
        platform=body.platform or ("upload" if upload_doc else _infer_platform(body.video_url)),
        title=body.title or (upload_doc.get("original_filename") if upload_doc else _title_from_url(body.video_url)),
        description=body.description,
        duration_sec=body.duration_sec,
        niche=u.get("niche"),
        status="queued", progress=5,
    )
    await analyses_col.insert_one(doc.model_dump())
    bg.add_task(run_pipeline, doc.id, user_id)
    return _analysis_public(doc.model_dump())


@api.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str, user_id: str = CurrentUserId):
    a = await analyses_col.find_one({"id": analysis_id, "user_id": user_id}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Not found")
    return _analysis_public(a)


@api.get("/analyses")
async def list_analyses(user_id: str = CurrentUserId, mode: Optional[str] = None, limit: int = 50):
    q: Dict[str, Any] = {"user_id": user_id}
    if mode in ("study", "test"):
        q["mode"] = mode
    cur = analyses_col.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = [_analysis_public(a) for a in await cur.to_list(length=limit)]
    return {"items": items}


@api.post("/scripts/{script_id}/rate")
async def rate_script(script_id: str, body: RateScriptBody, user_id: str = CurrentUserId):
    doc = {
        "id": _uuid(), "script_id": script_id, "user_id": user_id,
        "scores": body.scores, "chosen": body.chosen,
        "edited_final": body.edited_final, "created_at": _now_iso(),
    }
    await ratings_col.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api.post("/outcomes")
async def add_outcome(body: OutcomeBody, user_id: str = CurrentUserId):
    doc = OutcomeDoc(
        user_id=user_id, analysis_id=body.analysis_id, script_id=body.script_id,
        platform=body.platform, views=body.views, retention=body.retention,
        saves=body.saves, posted_at=body.posted_at,
    )
    await outcomes_col.insert_one(doc.model_dump())
    return {"ok": True, "id": doc.id}


@api.get("/outcomes")
async def list_outcomes(user_id: str = CurrentUserId):
    cur = outcomes_col.find({"user_id": user_id}, {"_id": 0}).sort("captured_at", -1).limit(100)
    items = await cur.to_list(length=100)
    return {"items": items}


# ---------- Vault & Dashboard ----------
@api.get("/vault")
async def get_vault(user_id: str = CurrentUserId):
    cur = vault_col.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(200)
    items = await cur.to_list(length=200)
    return {"items": items}


@api.get("/dashboard/stats")
async def dashboard_stats(user_id: str = CurrentUserId):
    study_count = await analyses_col.count_documents({"user_id": user_id, "mode": "study"})
    test_count = await analyses_col.count_documents({"user_id": user_id, "mode": "test"})
    vault_count = await vault_col.count_documents({"user_id": user_id})
    outcomes_count = await outcomes_col.count_documents({"user_id": user_id})

    avg = 0
    cur = analyses_col.find(
        {"user_id": user_id, "mode": "test", "alignment": {"$ne": None}},
        {"_id": 0, "alignment": 1},
    ).limit(100)
    items = await cur.to_list(length=100)
    composites = [it["alignment"].get("composite", 0) for it in items if it.get("alignment")]
    if composites:
        avg = round(sum(composites) / len(composites))

    return {
        "study_count": study_count, "test_count": test_count,
        "vault_count": vault_count, "outcomes_count": outcomes_count,
        "avg_alignment": avg,
    }


@api.get("/")
async def root():
    return {"ok": True, "app": "TrendFlowAI", "version": "0.1"}


# ---------- Sharing ----------
def _generate_slug() -> str:
    # 10-char URL-safe (~60 bits). Collisions are vanishingly rare; we retry on conflict.
    return secrets.token_urlsafe(8)[:10]


@api.post("/analysis/{analysis_id}/share")
async def share_analysis(analysis_id: str, user_id: str = CurrentUserId):
    a = await analyses_col.find_one({"id": analysis_id, "user_id": user_id}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Not found")
    if a.get("status") != "done":
        raise HTTPException(400, "Analysis must be complete before sharing")

    existing_slug = a.get("shared_slug")
    if existing_slug:
        return {"slug": existing_slug, "shared_at": a.get("shared_at")}

    for _ in range(5):
        candidate = _generate_slug()
        collision = await analyses_col.find_one({"shared_slug": candidate}, {"_id": 0})
        if not collision:
            shared_at = _now_iso()
            await analyses_col.update_one(
                {"id": analysis_id},
                {"$set": {"shared_slug": candidate, "shared_at": shared_at, "updated_at": shared_at}},
            )
            return {"slug": candidate, "shared_at": shared_at}
    raise HTTPException(500, "Could not generate unique slug")


@api.post("/analysis/{analysis_id}/unshare")
async def unshare_analysis(analysis_id: str, user_id: str = CurrentUserId):
    a = await analyses_col.find_one({"id": analysis_id, "user_id": user_id}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Not found")
    # $unset removes the field entirely so the partial-filter unique index doesn't index it.
    await analyses_col.update_one(
        {"id": analysis_id},
        {
            "$unset": {"shared_slug": "", "shared_at": ""},
            "$set": {"updated_at": _now_iso()},
        },
    )
    return {"ok": True}


@api.get("/public/r/{slug}")
async def get_public_report(slug: str):
    a = await analyses_col.find_one({"shared_slug": slug, "status": "done"}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Report not found or no longer shared")
    return _analysis_public_view(a)



# ---------- Trend Intelligence (Phase 1 — TikTok deep; others stub) ----------
@api.get("/trends/pulse")
async def trends_pulse(platform: str = "tiktok"):
    """Daily/near-daily pulse of currently winning videos for a platform menu."""
    p = (platform or "tiktok").lower()
    if p in PLATFORM_STUBS:
        stub = PLATFORM_STUBS[p]
        return {
            "platform": p,
            "status": "coming",
            "lens": stub["lens"],
            "message": stub["message"],
            "pulse": None,
            "as_of": None,
        }
    pulse = _TREND_PULSES.get(p)
    if not pulse:
        raise HTTPException(404, f"No pulse for platform={p}")
    return {"platform": p, "status": "ready", "pulse": pulse, "as_of": pulse.get("as_of")}


@api.get("/trends/clusters")
async def trends_clusters(platform: str = "tiktok"):
    p = (platform or "tiktok").lower()
    if p in PLATFORM_STUBS:
        stub = PLATFORM_STUBS[p]
        return {
            "platform": p,
            "status": "coming",
            "lens": stub["lens"],
            "message": stub["message"],
            "items": [],
            "as_of": None,
        }
    items = _TREND_CLUSTERS.get(p, [])
    return {
        "platform": p,
        "status": "ready",
        "items": items,
        "as_of": items[0].get("as_of") if items else None,
    }


@api.get("/trends/clusters/{cluster_id}")
async def trend_cluster_detail(cluster_id: str):
    for plat, items in _TREND_CLUSTERS.items():
        for c in items:
            if c["id"] == cluster_id:
                return {**c, "platform": plat, "status": "ready"}
    raise HTTPException(404, "Cluster not found")


@api.get("/platforms")
async def list_platforms():
    """Desktop platform menu bar — each is a distinct curation/scoring engine."""
    return {
        "platforms": [
            {"id": "tiktok", "label": "TikTok", "status": "ready", "lens": "FYP velocity, 0–3s hook, completion/rewatch, sound fit"},
            {"id": "youtube", "label": "YouTube", "status": "ready", "lens": "Shorts pre-flight: hook, title/cover fit, retention, CTA"},
            {"id": "instagram", "label": "Instagram", "status": "coming", "lens": PLATFORM_STUBS["instagram"]["lens"]},
            {"id": "facebook", "label": "Facebook", "status": "coming", "lens": PLATFORM_STUBS["facebook"]["lens"]},
        ],
        "modes": ["study", "test", "trends"],
        "lock": "Each platform menu is a distinct curation and scoring surface — not one shared analyzer with a dropdown.",
    }


# ---------- Swarm Command export (stub) ----------
@api.post("/export/swarm-command")
async def export_swarm_command(user_id: str = CurrentUserId):
    """Phase 1 stub — live Swarm Command export ships with Command deploy."""
    raise HTTPException(
        status_code=501,
        detail=(
            "Send to Swarm Command is not wired yet. "
            "Set SWARM_COMMAND_BASE_URL + SWARM_COMMAND_API_KEY and deploy Swarm Command stubs, "
            "then this endpoint will upsert posts + metrics_snapshots (raw.source=trendflow)."
        ),
    )


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        storage.init_storage()
        log.info("Object storage ready")
    except Exception as e:
        log.error(f"Object storage init failed (uploads will fail until fixed): {e}")
    # Drop legacy sparse index (which also indexed null), then create a partial-filter
    # unique index that ONLY indexes documents whose shared_slug is a non-null string.
    try:
        await analyses_col.drop_index("shared_slug_1")
    except Exception:
        pass
    try:
        await analyses_col.create_index(
            "shared_slug",
            unique=True,
            partialFilterExpression={"shared_slug": {"$type": "string"}},
        )
    except Exception as e:
        log.warning(f"Index create on shared_slug failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()
