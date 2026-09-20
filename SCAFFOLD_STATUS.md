# Scaffold status (box vs GitHub)

Full Runtime A tree is built at `/workspace/trendflowai` on the agent box.

## On GitHub (this PR) — product shell + locks
- README with pre-flight + §3c platform menu locks
- Platform menu UI: TikTok | YouTube | Instagram | Facebook
- Mode tabs Study | Test | Trends; PlatformAnalyze; PlatformComing stubs
- Backend: auth, models, storage (local), requirements (no Emergent), trends_seed
- App routes `/:platform/:mode`

## Still on box — push follow-up (large MCP payloads)
- `backend/server.py` (trends endpoints + export 501 stub + pipeline)
- `backend/llm.py` (Anthropic + Gemini, no Emergent)
- `backend/video.py`
- `supabase/migrations/001_init.sql`
- `frontend/src/components/trends/TrendsPanel.jsx`
- StudyMode / TestMode / AnalysisView + scorecard UI kit
- Remaining landing/dashboard/ui components

Copy from box: use `/workspace/trendflowai` as source of truth, or continue MCP `push_files` batches onto this branch.
