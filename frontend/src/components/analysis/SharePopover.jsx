import React, { useState } from "react";
import { Share2, Copy, Check, Loader2, Code2 } from "lucide-react";
import api from "../../lib/api";

/**
 * Share button only — no popover. Shown when an analysis is not yet shared.
 */
export function ShareCreateButton({ analysis, onShared, disabled }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const share = async () => {
    setLoading(true); setErr("");
    try {
      const { data } = await api.post(`/analysis/${analysis.id}/share`);
      onShared?.({ shared_slug: data.slug, shared_at: data.shared_at });
    } catch (e) {
      setErr(e?.response?.data?.detail || "Could not create share link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={share}
        disabled={disabled || loading}
        data-testid="share-create-btn"
        className="inline-flex items-center gap-2 text-sm border border-neutral-800 hover:border-yellow-500 hover:text-yellow-500 px-3 py-2 rounded-sm transition-colors disabled:opacity-40"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
        Share report
      </button>
      {err && <div className="absolute right-0 top-full mt-2 text-xs text-red-400 whitespace-nowrap" data-testid="share-error">{err}</div>}
    </div>
  );
}

/**
 * Share popover — copy link + embed code + make-private toggle. Shown when analysis is already shared.
 */
export function SharePopover({ publicUrl, slug, onUnshare, error }) {
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const embedSnippet = slug
    ? `<iframe src="${window.location.origin}/embed/${slug}" width="600" height="800" frameborder="0" style="border:1px solid #262626;border-radius:4px;"></iframe>`
    : "";

  const copy = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 1800);
    } catch {
      setLocalErr("Copy failed — select the text and copy manually");
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-[380px] p-4 border border-neutral-800 bg-[#0c0c0c] rounded-sm shadow-xl z-20"
      data-testid="share-popover"
    >
      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Public link</div>
      <div className="flex items-center gap-2 mb-4">
        <input
          readOnly value={publicUrl}
          data-testid="share-url-input"
          className="flex-1 min-w-0 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-sm text-xs mono text-white"
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={() => copy(publicUrl, setCopied)}
          data-testid="share-copy-btn"
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-2 rounded-sm flex items-center gap-1 text-xs font-medium flex-shrink-0"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-2">
        <Code2 size={12} /> Embed code
      </div>
      <div className="flex items-stretch gap-2 mb-3">
        <textarea
          readOnly value={embedSnippet}
          data-testid="share-embed-input"
          rows={3}
          className="flex-1 min-w-0 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-sm text-[10px] mono text-neutral-300 resize-none"
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={() => copy(embedSnippet, setEmbedCopied)}
          data-testid="share-embed-copy-btn"
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 rounded-sm flex items-center gap-1 text-xs font-medium flex-shrink-0"
        >
          {embedCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
        Paste the iframe into Notion, Substack, Medium or any site that allows HTML embeds.
      </p>

      <UnshareButton onUnshare={onUnshare} />
      {(error || localErr) && <div className="text-xs text-red-400 mt-2" data-testid="share-error">{error || localErr}</div>}
    </div>
  );
}

function UnshareButton({ onUnshare }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await onUnshare(); } finally { setLoading(false); }
  };
  return (
    <button
      onClick={handle}
      disabled={loading}
      data-testid="share-unshare-btn"
      className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-red-400 transition-colors"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : null}
      Make private
    </button>
  );
}
