"""Pydantic models for TrendFlowAI."""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import uuid


def _uuid() -> str:
    return str(uuid.uuid4())


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------- Auth / Profile ---------------- #
class UserDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    email: EmailStr
    password_hash: str
    name: str
    niche: Optional[str] = None
    brand_voice: Optional[Dict[str, Any]] = None
    subscription_tier: Literal["free", "creator", "pro", "agency"] = "free"
    onboarded: bool = False
    created_at: str = Field(default_factory=_now_iso)


class SignupBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    user: Dict[str, Any]


class ProfileBody(BaseModel):
    niche: str
    brand_voice: Dict[str, Any]


class AnalyzeBody(BaseModel):
    mode: Literal["study", "test"]
    video_url: Optional[str] = None
    upload_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[str] = None
    duration_sec: Optional[int] = None


class AnalysisDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    mode: Literal["study", "test"]
    status: Literal["queued", "downloading", "perceiving", "analyzing", "generating", "done", "failed"] = "queued"
    progress: int = 0
    error: Optional[str] = None
    video_url: Optional[str] = None
    upload_id: Optional[str] = None
    platform: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    duration_sec: Optional[int] = None
    outlier_multiplier: float = 1.0
    niche: Optional[str] = None
    perception: Optional[Dict[str, Any]] = None
    scorecard: Optional[Dict[str, Any]] = None
    scripts: List[Dict[str, Any]] = Field(default_factory=list)
    alignment: Optional[Dict[str, Any]] = None
    detected_angle: Optional[str] = None
    trend_comparison: Optional[Dict[str, Any]] = None
    overall_score: Optional[float] = None
    band: Optional[str] = None
    post_id: Optional[str] = None
    as_of: Optional[str] = None
    sent_to_swarm_command: bool = False
    shared_slug: Optional[str] = None
    shared_at: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)
    updated_at: str = Field(default_factory=_now_iso)


class RateScriptBody(BaseModel):
    scores: Dict[str, int] = Field(default_factory=dict)
    chosen: bool = False
    edited_final: Optional[str] = None


class OutcomeBody(BaseModel):
    analysis_id: Optional[str] = None
    script_id: Optional[str] = None
    platform: str
    views: int = 0
    retention: float = 0.0
    saves: int = 0
    posted_at: Optional[str] = None


class OutcomeDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    analysis_id: Optional[str] = None
    script_id: Optional[str] = None
    platform: str
    views: int
    retention: float
    saves: int
    posted_at: Optional[str] = None
    captured_at: str = Field(default_factory=_now_iso)


NICHES = [
    "fitness", "real_estate", "beauty", "finance", "food",
    "fashion", "tech", "travel", "education", "comedy",
    "gaming", "parenting", "business", "music", "lifestyle",
]

COMPONENTS = [
    {"id": "hook", "name": "Hook (0-3s)", "weight": 0.18},
    {"id": "pacing", "name": "Pacing & Cuts", "weight": 0.10},
    {"id": "pattern_interrupt", "name": "Pattern Interrupts", "weight": 0.08},
    {"id": "emotional_driver", "name": "Emotional Driver", "weight": 0.10},
    {"id": "narrative_structure", "name": "Narrative Structure", "weight": 0.12},
    {"id": "visual_composition", "name": "Visual Composition", "weight": 0.08},
    {"id": "on_screen_text", "name": "On-Screen Text", "weight": 0.08},
    {"id": "audio", "name": "Audio / Sound", "weight": 0.10},
    {"id": "authenticity", "name": "Authenticity", "weight": 0.08},
    {"id": "cta", "name": "CTA & Loop", "weight": 0.08},
]

TIERS = [
    {"id": "free", "name": "Free", "price": 0, "annual_price": 0, "credits": 3,
     "tagline": "Try the engine.", "audience": "Aspiring creator",
     "features": ["3 video analyses (lifetime)", "Full 10-component teardown", "Basic Vault", "Public shareable reports"],
     "limits": {"credits_per_month": 0, "lifetime_credits": 3, "vault": 5}},
    {"id": "creator", "name": "Creator", "price": 29, "annual_price": 19, "credits": 17,
     "tagline": "Ship more, guess less.", "audience": "Serious part-timer",
     "features": ["17 analyses / month", "Study + Test modes", "Brand voice tuning", "Unlimited Vault", "Priority queue", "Embed widget"],
     "limits": {"credits_per_month": 17, "vault": -1}},
    {"id": "pro", "name": "Pro", "price": 69, "annual_price": 49, "credits": 50,
     "tagline": "For full-time creators.", "audience": "Monetizing full-timer",
     "features": ["50 analyses / month", "Everything in Creator", "Outcome tracking", "Niche benchmarks", "Coaching nudges", "API access (beta)"],
     "limits": {"credits_per_month": 50, "vault": -1}},
    {"id": "agency", "name": "Agency", "price": 199, "annual_price": 149, "credits": 150,
     "tagline": "Teams & client work.", "audience": "SMM / multi-brand",
     "features": ["150 pooled analyses / month", "Everything in Pro", "5 seats included", "White-label exports", "SSO", "Account manager"],
     "limits": {"credits_per_month": 150, "vault": -1, "seats": 5}},
]

TOPUPS = [
    {"id": "pack_20", "price": 25, "credits": 20, "per_video": 1.25, "label": "20 video credits"},
    {"id": "pack_40", "price": 50, "credits": 40, "per_video": 1.25, "label": "40 video credits"},
    {"id": "pack_90", "price": 100, "credits": 90, "per_video": 1.11, "label": "90 video credits", "best_value": True},
]
