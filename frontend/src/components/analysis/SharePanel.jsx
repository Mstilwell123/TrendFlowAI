import React, { useState } from "react";
import { Share2 } from "lucide-react";
import api from "../../lib/api";
import { ShareCreateButton, SharePopover } from "./SharePopover";

export default function SharePanel({ analysis, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const slug = analysis?.shared_slug;
  const publicUrl = slug ? `${window.location.origin}/r/${slug}` : "";

  const handleShared = (fields) => {
    onUpdated?.(fields);
    setOpen(true);
  };

  const handleUnshare = async () => {
    setErr("");
    try {
      await api.post(`/analysis/${analysis.id}/unshare`);
      onUpdated?.({ shared_slug: null, shared_at: null });
      setOpen(false);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Could not unshare");
    }
  };

  if (!slug) {
    return (
      <div data-testid="share-panel">
        <ShareCreateButton
          analysis={analysis}
          onShared={handleShared}
          disabled={analysis?.status !== "done"}
        />
      </div>
    );
  }

  return (
    <div className="relative inline-block" data-testid="share-panel">
      <button
        onClick={() => setOpen(!open)}
        data-testid="share-toggle-btn"
        className="inline-flex items-center gap-2 text-sm bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/20 px-3 py-2 rounded-sm transition-colors"
      >
        <Share2 size={14} />
        Shared · public
      </button>
      {open && <SharePopover publicUrl={publicUrl} slug={slug} onUnshare={handleUnshare} error={err} />}
    </div>
  );
}
