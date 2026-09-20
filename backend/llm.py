"""LLM pipeline: Gemini for perception, Claude for reason/scorecard/scripts.
No Emergent SDK — uses ANTHROPIC_API_KEY + GEMINI_API_KEY (or GOOGLE_API_KEY).
"""
import os
import json
import re
import uuid
import asyncio
import logging
from typing import Dict, Any, List, Optional

log = logging.getLogger("llm")

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-20250514")

# NOTE: truncated push will be replaced - loading full from box via follow-up if this fails size check
PERCEPTION_SYSTEM = "see box"
