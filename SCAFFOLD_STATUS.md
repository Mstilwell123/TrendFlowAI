# Scaffold status (box vs GitHub)

Full Runtime A tree is at `/workspace/trendflowai` on the agent box.
Branch: `feat/phase0-phase1-tiktok` · PR: https://github.com/Mstilwell123/TrendFlowAI/pull/1

## Product lock
Desktop menu: **TikTok | YouTube | Instagram | Facebook** (distinct engines) — verified in `platforms.js` / PlatformMenuBar.

## BYOK step 3 — Connect your AI (§3d) — scaffolded 2026-09-20

| Area | Status | Notes |
|------|--------|-------|
| Connect AI onboarding UI | **Scaffolded** | Step 3 `ConnectAIStep` + shared `ConnectAIForm`; Recommended badges; password key inputs |
| Settings mirror | **Scaffolded** | Settings → AI providers uses same `ConnectAIForm` |
| Encryption | **Scaffolded** | `crypto_keys.py` Fernet via `TRENDFLOW_KEY_ENCRYPTION_SECRET`; ephemeral local escape documented |
| Provider adapters | **Scaffolded (callable stubs)** | `providers/{base,gemini,anthropic,xai}.py` — live SDK/HTTP paths; wire-complete for Study/Test via `llm.py` |
| Study/Test error paths using user keys | **Scaffolded** | Resolve user keys first; 402 on analyze if missing; pipeline maps auth/quota → "Your API key or quota failed" |
| Profile / onboarded gate | **Scaffolded** | `POST /profile` no longer sets onboarded alone; `POST /onboarding/complete` requires keys |

### Remaining / honesty notes
- Provider adapters are production-shaped but not exhaustively integration-tested against live quotas
- Supabase `002_ai_config.sql` columns ready; Runtime A Mongo still primary for local bootstrap
- Hosted credits tier (optional later) not started
- Collapse any historical `.server_chunk_*.txt` loaders if still present on remote

## On GitHub (this PR) — critical paths

### Backend
- `backend/server.py` — profile gate, `/ai-config`, `/onboarding/complete`, BYOK pipeline
- `backend/llm.py` — user-key resolution + provider adapters
- `backend/crypto_keys.py`, `backend/providers/*`
- `backend/models.py` — `AiConfigPutBody`, `AiProviderConfigPublic`, `complete_onboarding`
- `supabase/migrations/002_ai_config.sql`

### Frontend
- `frontend/src/components/ai/ConnectAIForm.jsx`
- `frontend/src/components/onboarding/ConnectAIStep.jsx`
- `frontend/src/pages/Onboarding.jsx` — 3 steps
- `frontend/src/pages/Settings.jsx` — AI providers section

## Env
See `.env.example`: `TRENDFLOW_KEY_ENCRYPTION_SECRET`, `ALLOW_DEV_SHARED_LLM_KEYS=false`, BYOK notes.

Source of truth: `/workspace/trendflowai`
