"""TrendFlowAI server — loads chunked source (MCP push size limit)."""
from pathlib import Path
_dir = Path(__file__).parent
_src = "".join((_dir / f".server_chunk_{i}.txt").read_text() for i in range(9))
exec(compile(_src, str(_dir / "server.py"), "exec"), globals())
