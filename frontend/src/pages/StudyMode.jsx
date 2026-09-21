import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Search, Loader2, Link as LinkIcon } from "lucide-react";
import { isShortsPlatform } from "../lib/shortsRubric";

export default function StudyMode({ embedded = false, platform = "tiktok" } = {}) {
  const nav = useNavigate();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const shorts = isShortsPlatform(platform);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/analyze", {
        mode: "study",
        video_url: url.trim(),
        title: title.trim() || null,
        description: description.trim() || null,
        duration_sec: parseInt(duration) || 30,
        platform: platform || "tiktok",
      });
      nav(`/app/analysis/${data.id}`);
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Failed to start analysis");
    } finally {
      setLoading(false);
    }
  };

  const wrapClass = embedded
    ? "max-w-4xl"
    : "px-5 lg:px-10 py-8 lg:py-12 max-w-4xl mx-auto";

  return (
    <div className={wrapClass} data-testid="study-page">
      {!embedded && (
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Study Mode</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Tear down a viral video.</h1>
        <p className="text-neutral-400 mt-3 max-w-2xl">
          Paste any short-form URL. We'll produce a 10-component structural teardown and 10 ready-to-film scripts
          built for your niche and brand voice.
        </p>
      </div>
      )}
      {embedded && (
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">
            {shorts ? "Study · YouTube Shorts" : `Study · ${platform}`}
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            {shorts
              ? "Paste a reference Short URL to learn the Shorts pre-flight rubric (support mode — Test is the hero)."
              : "Paste a TikTok URL. Pre-flight teardown + 10 scripts, benchmarked vs today’s winners."}
          </p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 p-6 lg:p-8 border border-neutral-900 bg-[#0f0f0f] rounded-sm" data-testid="study-form">
        <div>
          <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Video URL</label>
          <div className="relative">
            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
              data-testid="study-url-input"
              placeholder="https://www.tiktok.com/@user/video/123… or YouTube Shorts URL"
              className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Title (optional)</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              data-testid="study-title-input"
              placeholder="What's the video about?"
              className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Estimated duration (sec)</label>
            <input
              type="number" min="8" max="120" value={duration} onChange={(e) => setDuration(e.target.value)}
              data-testid="study-duration-input"
              className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Quick notes (optional)</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            data-testid="study-description-input"
            placeholder="Anything that helps us — e.g. 'creator demos a hack with a fast first-frame pattern interrupt'"
            className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
        {err && <div className="text-sm text-red-400" data-testid="study-error">{err}</div>}
        <button
          type="submit" disabled={loading}
          data-testid="study-submit-btn"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-sm disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? "Starting analysis…" : "Analyze video"}
        </button>
      </form>

      <div className="mt-8 p-5 border border-neutral-900 rounded-sm bg-[#0c0c0c]">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">How it works</div>
        <ol className="space-y-2 text-sm text-neutral-300">
          <li><span className="mono text-yellow-500 mr-2">01</span> Perception (Gemini) — extracts shots, transcript, audio cues, on-screen text.</li>
          <li><span className="mono text-yellow-500 mr-2">02</span> Component scoring (Claude) — judges the 10 Shorts/structural levers with timestamp evidence.</li>
          <li><span className="mono text-yellow-500 mr-2">03</span> Script engine — 10 ready-to-film scripts, each a distinct hook × format × driver, in your voice.</li>
        </ol>
      </div>
    </div>
  );
}
