"""LLM pipeline — loads chunked source (MCP push size limit)."""
from pathlib import Path
_dir = Path(__file__).parent
_src = "".join((_dir / f".llm_chunk_{i}.txt").read_text() for i in range(6))
exec(compile(_src, str(_dir / "llm.py"), "exec"), globals())
