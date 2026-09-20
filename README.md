# TrendFlowAI

Desktop-first short-form pre-flight analyzer for Agent Swarm Skool ($10/mo).

> Most tools sell post-mortem analysis. TrendFlow sells the pre-flight check.

## Product locks
- **Pre-flight:** score drafts vs currently viral/high-performing videos (not flop-only)
- **Analyze modes:** Study | Test | **Trends** (Trend Intelligence is Phase 1 with TikTok)
- **Runtime A:** FastAPI + React (ported from Viral Trend), Supabase, Claude + Gemini (no Emergent lock-in)
- **Command export:** stub until `swarm-command` GitHub exists

## Status
Phase 0–1 scaffolding in progress. See unified spec in repo docs once merged.

## Stack
- Backend: FastAPI
- Frontend: React (desktop-first)
- DB: Supabase
- LLMs: Claude (reason) + Gemini (perception)
