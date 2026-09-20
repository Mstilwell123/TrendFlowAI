# Scaffold status (box vs GitHub)

Full Runtime A tree is at `/workspace/trendflowai` on the agent box.
Branch: `feat/phase0-phase1-tiktok` · PR: https://github.com/Mstilwell123/TrendFlowAI/pull/1

## Product lock
Desktop menu: **TikTok | YouTube | Instagram | Facebook** (distinct engines) — verified in `platforms.js` / PlatformMenuBar.

## On GitHub (this PR) — synced this session
### Backend
- `backend/video.py` (yt-dlp acquisition)
- `backend/models.py` (richer Pydantic models — 7016 bytes)
- `supabase/migrations/001_init.sql`

### Frontend Analyze (Study / Test / Trends)
- `frontend/src/pages/StudyMode.jsx`
- `frontend/src/pages/TestMode.jsx`
- `frontend/src/pages/AnalysisView.jsx`
- `frontend/src/components/trends/TrendsPanel.jsx` (+ AngleVsTrend already on branch)
- Analysis scorecard kit under `frontend/src/components/analysis/` (all)
- `frontend/src/components/test/TestUploadZone.jsx`, `TestMetadataForm.jsx`
- `frontend/src/components/AlignmentGauge.jsx`
- Lib helpers: `api.js`, `auth.jsx`, `constants.js`, `pricing.js`, `utils.js`

### Already on branch (pre-existing shell)
- Platform menu UI, ModeTabs, PlatformAnalyze, Layout, Sidebar, App routes

## CRITICAL GAPS — still need full push from box
- `backend/llm.py` — **currently a TEMP stub on GitHub; restore from box** (payload staged: `agent-tools/mcp-push-tf-llm-FULL.json`)
- `backend/server.py` — **missing on GitHub** (payload staged: `agent-tools/mcp-push-tf-server-FULL.json`)

## Also still on box (non-blocking for Study/Test/Trends core)
- Landing/dashboard/pricing/public pages App.js imports (Landing, Login, Signup, Dashboard, Vault, Settings, PublicReport, EmbedReport, Pricing, Onboarding)
- UI kit under `frontend/src/components/ui/`
- Landing/dashboard/onboarding/settings/pricing component trees

Source of truth: `/workspace/trendflowai`
