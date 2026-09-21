import React from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SharePanel from "./SharePanel";

export default function AnalysisHeader({ a, onUpdated }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs uppercase tracking-widest ${a.mode === "study" ? "text-yellow-500" : "text-lime-400"}`}
            data-testid="analysis-mode"
          >
            {a.mode === "study" ? "Study Mode" : "Test Mode"}
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-xs uppercase tracking-widest text-neutral-500">{a.platform || "—"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="analysis-title">
          {a.title || "Untitled video"}
        </h1>
        {a.video_url && (
          <a
            href={a.video_url} target="_blank" rel="noreferrer"
            className="text-xs text-neutral-500 hover:text-yellow-500 truncate inline-block max-w-full mt-1"
            data-testid="analysis-url"
          >
            {a.video_url}
          </a>
        )}
      </div>
      {a.status === "done" && <SharePanel analysis={a} onUpdated={onUpdated} />}
    </div>
  );
}

export function AnalysisFailed({ error }) {
  return (
    <div className="mb-8 p-5 border border-red-900 bg-red-950/30 rounded-sm" data-testid="analysis-failed">
      <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
        <AlertCircle size={16} /> Analysis failed
      </div>
      <div className="text-sm text-neutral-300">{error || "Something went wrong."}</div>
    </div>
  );
}

export function BackLink() {
  return (
    <Link
      to="/app"
      className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6"
      data-testid="analysis-back-btn"
    >
      <ArrowLeft size={14} /> Back
    </Link>
  );
}
