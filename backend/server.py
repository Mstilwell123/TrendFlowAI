"""TrendFlowAI — FastAPI backend (Runtime A).

Canonical source is assembled from sibling `.server_chunk_*.txt` shards
(exact text of box `/workspace/trendflowai/backend/server.py`, split for
GitHub MCP content-size limits). Runtime behavior matches the monolithic file.
"""
from pathlib import Path as _Path
_src = "".join(
    (_Path(__file__).parent / f".server_chunk_{_i}.txt").read_text()
    for _i in range(4)
)
exec(compile(_src, __file__, "exec"), globals())
