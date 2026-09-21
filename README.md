# TrendFlowAI

**Most tools sell post-mortem analysis. TrendFlow sells the pre-flight check.**

Runtime A: FastAPI + React, ported from Viral Trend and rebranded TrendFlow. Prefer Supabase (schema shipped). No Emergent lock-in. Swarm Command export stubbed (501).

Domain: [trendflowai.ai](https://trendflowai.ai)

## Product locks (honor in UI + copy)

1. **Pre-flight:** Analyze a draft **before** publish; compare vs **currently viral / high-performing** videos (not flop-only).
2. **Trend Intelligence is Phase 1** — TikTok Analyze modes **Study | Test | Trends** (not deferred).
3. **Desktop platform menu (LOCKED):** **`TikTok | YouTube | Instagram | Facebook`**
   - Each menu is a **distinct curation/scoring engine** (platform-native trends + rubrics).
   - **Not** one shared analyzer with a platform dropdown.
   - Inside each menu: **Study | Test | Trends** (scoped to that platform).
   - **v1 product lock (2026-09-20):** deep **YouTube Shorts** pre-flight scorecard; TikTok remains in-tree; Instagram / Facebook = coming stubs.

## Phase 0–1 scope

| In | Out |
|----|-----|
| TikTok Study / Test / Trends + scorecard | Live Swarm Command |
| Seeded TikTok trend pulses/clusters | Stripe |
| Your angle vs the trend panel | Full Creator DNA port |
| `POST /api/export/swarm-command` → 501 | Production deploy |
| Supabase `001_init.sql` | IG/YT/FB deep engines |



## BYOK — Connect your AI (product lock §3d)

TrendFlow sells the **desk** (menus, rubrics, Trends, DNA, pre-flight UX). Users bring compute.

1. Onboarding: Niche → Brand voice → **Connect your AI** (step 3)
2. Recommended defaults (badged, not required): Gemini perception + Claude (or Grok) reason
3. User free pickers either slot — **user choice always wins**
4. Keys stored per-user, Fernet-encrypted; Study/Test never use shared Pragvance env keys in prod
5. Errors: `"Your API key or quota failed"` / `"Connect your AI keys in Settings"`
6. `onboarded: true` only after step 3 saves keys (`POST /onboarding/complete`)
7. Same controls mirrored forever in **Settings → AI providers**

Endpoints: `GET/PUT /api/ai-config`, `POST /api/onboarding/complete`. Profile niche/brand alone does **not** set onboarded.

## Repo layout

```
backend/          FastAPI (auth, analyze pipeline, trends, export stub)
frontend/         React CRA + Tailwind (desktop-first Analyze shell)
supabase/migrations/001_init.sql
.env.example
```

### Key paths

- `backend/server.py` — API + pipeline + `/api/trends/*` + export stub
- `backend/llm.py` — BYOK perception + reason (per-user encrypted keys; env keys = local smoke only)
- `backend/crypto_keys.py` — Fernet encrypt/decrypt (`TRENDFLOW_KEY_ENCRYPTION_SECRET`)
- `backend/providers/` — Gemini / Anthropic / xAI adapters
- Onboarding step 3: `ConnectAIStep` + Settings `ConnectAIForm`
- `backend/trends_seed.py` — sample TikTok clusters
- `frontend/src/pages/PlatformAnalyze.jsx` — platform menu + mode tabs
- `frontend/src/components/analyze/PlatformMenuBar.jsx`
- `frontend/src/components/trends/TrendsPanel.jsx` / `AngleVsTrend.jsx`
- `supabase/migrations/001_init.sql` — profiles, analyses, trend_pulses, trend_clusters, outcomes, briefs

## How to run (local)

### Prerequisites

- Python 3.11+, Node 18+, MongoDB (local bootstrap), yt-dlp on PATH optional
- BYOK: set `TRENDFLOW_KEY_ENCRYPTION_SECRET`, then connect keys in onboarding step 3 / Settings
- Local smoke only: `ALLOW_DEV_SHARED_LLM_KEYS=true` + env `ANTHROPIC_API_KEY`/`GEMINI_API_KEY` (never for customer traffic)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env   # fill keys + MONGO_URL
uvicorn server:app --reload --port 8000
```

Health: `GET http://localhost:8000/api/` → `{ "app": "TrendFlowAI" }`

### Frontend

```bash
cd frontend
cp .env.example .env      # REACT_APP_BACKEND_URL=http://localhost:8000
yarn install              # or npm install
yarn start                # http://localhost:3000
```

Desktop-first: sidebar + platform menu bar. Open **Analyze** → TikTok → Study | Test | Trends.

### Supabase

Apply `supabase/migrations/001_init.sql` in your Supabase project. Runtime A still uses Mongo for local bootstrap; cut over when ready.

## API (Phase 1)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/analyze` | Study (URL) or Test (upload_id); `platform=tiktok` |
| GET | `/api/analysis/:id` | Includes `trend_comparison`, `detected_angle`, `band` |
| GET | `/api/trends/pulse?platform=` | TikTok + YouTube Shorts ready; IG/FB `status=coming` |
| GET | `/api/trends/clusters?platform=` | Seeded TikTok angle clusters |
| GET | `/api/platforms` | Menu metadata |
| POST | `/api/export/swarm-command` | **501** stub until Command is live |

## Band cutovers

`loser` &lt;40 · `baseline` 40–59 · `momentum` 60–79 · `winner` ≥80

## Blockers / stubs

- Without LLM keys, Study/Test pipeline errors; Trends UI uses seeded clusters.
- Swarm Command export returns 501 with a clear message.
- Instagram / Facebook menus are intentional stubs. YouTube Shorts pre-flight is live (Test hero / Study support / thin Trends).
- Creator DNA / night briefs: Settings shell only in this PR.

## License

Proprietary — Pragvance / Agent Swarm.

## Product lock — BYOK / compute-agnostic (§3d, 2026-09-20)
- TrendFlow sells the **desk** (menus, rubrics, Trends, DNA, pre-flight UX) — not bundled tokens.
- Users bring their own LLM keys (perception + reason): Anthropic, Gemini, xAI/Grok adapters.
- Per-user encrypted keys; clear errors when *their* quota fails.
- Dev `.env` keys OK for local smoke only; **prod default path = user BYOK**.
- Hosted credits tier = optional later, not MVP.
- Engineering: `PerceptionProvider` / `ReasonProvider` interfaces — wire in Settings/onboarding on shell-pages pass.

### Model choice (LOCKED with BYOK)
- UI recommends a strong default pair (e.g. Gemini perception + Claude or Grok reason) labeled **Recommended**.
- Every user picks their own favorites in Settings — **never force a model; user choice always wins**.

### Onboarding BYOK step (shipped in this PR)
**Required before `onboarded: true`:** Niche → Brand voice → Step 3 **Connect your AI**
- Pre-select Recommended (Gemini perception + Claude or Grok reason); user can change either slot
- Collect matching API keys; store per-user encrypted (`PUT /api/ai-config`)
- Mirror same controls in Settings → AI providers
- Study/Test resolve user keys first; auth/quota → "Your API key or quota failed"
- Never shared Pragvance env keys for customer traffic (`ALLOW_DEV_SHARED_LLM_KEYS` = local smoke only)


## Product lock — YouTube Shorts v1 (Geneis one-pager, 2026-09-20)
- **Platform:** YouTube Shorts ONLY for v1 hero job (pre-flight before upload).
- **Modes:** Test = hero; Study = support; Trends = thin helper.
- **Rubric:** 10 Shorts-native fields scored 1–5; show total + weakest 2 (fix-these-first).
- Adapt TikTok UI kit; Shorts field names win. TikTok scoring out of v1 product scope.
- No Vercel until Mark OK’s. No IG/FB engines in this slice.
