import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FolderOpen } from "lucide-react";

export default function Vault() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analyses${tab !== "all" ? `?mode=${tab}` : ""}`)
      .then((r) => setItems(r.data.items || []))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-12 max-w-7xl mx-auto" data-testid="vault-page">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">The Vault</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your proprietary pattern library.</h1>
        <p className="text-neutral-400 mt-3 max-w-2xl">Every analysis you run compounds into your benchmark data.</p>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-neutral-900">
        {[
          { id: "all", label: "All" },
          { id: "study", label: "Study" },
          { id: "test", label: "Test" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`vault-tab-${t.id}`}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              tab === t.id ? "border-yellow-500 text-white" : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-neutral-500 py-20" data-testid="vault-loading">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-900 rounded-sm" data-testid="vault-empty">
          <FolderOpen size={32} className="text-neutral-700 mx-auto mb-3" />
          <div className="text-neutral-400">Your vault is empty.</div>
          <Link to="/app/study" className="inline-block mt-4 text-yellow-500 hover:text-yellow-400" data-testid="vault-empty-cta">Start your first Study →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="vault-list">
          {items.map((a) => (
            <Link
              to={`/app/analysis/${a.id}`} key={a.id}
              data-testid={`vault-item-${a.id}`}
              className="block p-5 border border-neutral-900 hover:border-neutral-700 bg-[#101010] rounded-sm transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs uppercase tracking-widest ${a.mode === "study" ? "text-yellow-500" : "text-lime-400"}`}>
                  {a.mode}
                </span>
                <span className="text-xs text-neutral-500">{a.platform || "—"}</span>
              </div>
              <div className="text-sm font-semibold mb-1 truncate">{a.title || "Untitled"}</div>
              <div className="text-xs text-neutral-500 truncate">{a.video_url || "draft upload"}</div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-900">
                <span className="text-xs uppercase tracking-widest text-neutral-500">{a.status}</span>
                <span className="text-xs mono text-neutral-400">
                  {a.mode === "test" && a.alignment?.composite ? `${a.alignment.composite}/100` : a.scorecard?.composite ? `${a.scorecard.composite}/100` : "—"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
