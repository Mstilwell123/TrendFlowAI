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
   - Phase 1: deep **TikTok** only; YouTube / Instagram / Facebook = platform-native empty/coming shells.

## Phase 0–1 scope

| In | Out |
|----|-----|
| TikTok Study / Test / Trends + scorecard | Live Swarm Command |
| Seeded TikTok trend pulses/clusters | Stripe |
| Your angle vs the trend panel | Full Creator DNA port |
| `POST /api/export/swarm-command` → 501 | Production deploy |
| Supabase `001_init.sql` | IG/YT/FB deep engines |

## Repo layout

```
backend/          FastAPI (auth, analyze pipeline, trends, export stub)
frontend/         React CRA + Tailwind (desktop-first Analyze shell)
supabase/migrations/001_init.sql
.env.example
```

### Key paths

- `backend/server.py` — API + pipeline + `/api/trends/*` + export stub
- `backend/llm.py` — Gemini perception + Claude reason (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`)
- `backend/trends_seed.py` — sample TikTok clusters
- `frontend/src/pages/PlatformAnalyze.jsx` — platform menu + mode tabs
- `frontend/src/components/analyze/PlatformMenuBar.jsx`
- `frontend/src/components/trends/TrendsPanel.jsx` / `AngleVsTrend.jsx`
- `supabase/migrations/001_init.sql` — profiles, analyses, trend_pulses, trend_clusters, outcomes, briefs

## How to run (local)

### Prerequisites

- Python 3.11+, Node 18+, MongoDB (local bootstrap), yt-dlp on PATH optional
- API keys: `ANTHROPIC_API_KEY` + `GEMINI_API_KEY` (analysis fails without them; Trends seed UI works without)

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
| GET | `/api/trends/pulse?platform=` | TikTok ready; others `status=coming` |
| GET | `/api/trends/clusters?platform=` | Seeded TikTok angle clusters |
| GET | `/api/platforms` | Menu metadata |
| POST | `/api/export/swarm-command` | **501** stub until Command is live |

## Band cutovers

`loser` <40 · `baseline` 40–59 · `momentum` 60–79 · `winner` ≥80

## Blockers / stubs

- Without LLM keys, Study/Test pipeline errors; Trends UI uses seeded clusters.
- Swarm Command export returns 501 with a clear message.
- YouTube / Instagram / Facebook menus are intentional stubs (distinct engines TBD).
- Creator DNA / night briefs: Settings shell only in this PR.

## License

Proprietary — Pragvance / Agent Swarm.
