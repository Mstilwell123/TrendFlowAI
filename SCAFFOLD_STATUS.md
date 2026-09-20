# Scaffold status (box vs GitHub)

Full Runtime A tree is at `/workspace/trendflowai` on the agent box.
Branch: `feat/phase0-phase1-tiktok` · PR: https://github.com/Mstilwell123/TrendFlowAI/pull/1

## Product lock
Desktop menu: **TikTok | YouTube | Instagram | Facebook** (distinct engines) — verified in `platforms.js` / PlatformMenuBar.

## On GitHub (this PR) — critical paths synced

### Backend
- `backend/server.py` — chunk-loader; exact box source in `.server_chunk_{0..3}.txt` (join verified SHA256 `b540dd4d…` = box 24878 chars)
- `backend/llm.py` (15007) — full Anthropic+Gemini pipeline
- `backend/video.py` (4100) — yt-dlp acquisition
- `backend/models.py` (7016) — full richer Pydantic models
- `backend/auth.py`, `storage.py`, `trends_seed.py`, `requirements.txt`
- `supabase/migrations/001_init.sql` (5491)

### Frontend Analyze (Study / Test / Trends)
- `frontend/src/pages/StudyMode.jsx`, `TestMode.jsx`, `AnalysisView.jsx`, `PlatformAnalyze.jsx`
- `frontend/src/components/trends/TrendsPanel.jsx`, `AngleVsTrend.jsx`
- Analysis scorecard kit under `frontend/src/components/analysis/` (all 10)
- `frontend/src/components/test/TestUploadZone.jsx`, `TestMetadataForm.jsx`
- `frontend/src/components/AlignmentGauge.jsx`, `Layout.jsx`, `Sidebar.jsx`
- Lib helpers: `api.js`, `auth.jsx`, `constants.js`, `pricing.js`, `utils.js`, `platforms.js`

## Remaining gaps (non-blocking for Study/Test/Trends core)
- Prefer collapsing `.server_chunk_*.txt` into a single monolithic `backend/server.py` when a ~25KB MCP push is practical (loader is runtime-equivalent today)
- Landing/dashboard/pricing/public pages App.js imports (Landing, Login, Signup, Dashboard, Vault, Settings, PublicReport, EmbedReport, Pricing, Onboarding)
- UI kit under `frontend/src/components/ui/`
- Landing/dashboard/onboarding/settings/pricing component trees

Source of truth: `/workspace/trendflowai`
