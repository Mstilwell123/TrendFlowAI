import React, { useEffect, useState } from "react";
import { Loader2, Flame, Clock } from "lucide-react";
import api from "@/lib/api";

export default function TrendsPanel({ platform = "tiktok" }) {
  const [pulse, setPulse] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [meta, setMeta] = useState({ status: "loading", as_of: null, message: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr("");
      try {
        const [pRes, cRes] = await Promise.all([
          api.get("/trends/pulse", { params: { platform } }),
          api.get("/trends/clusters", { params: { platform } }),
        ]);
        if (cancelled) return;
        setMeta({
          status: pRes.data.status,
          as_of: pRes.data.as_of || cRes.data.as_of,
          message: pRes.data.message || cRes.data.message,
          lens: pRes.data.lens,
        });
        setPulse(pRes.data.pulse);
        setClusters(cRes.data.items || []);
        setSelected((cRes.data.items || [])[0] || null);
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.detail || "Failed to load trends");
      }
    })();
    return () => { cancelled = true; };
  }, [platform]);

  if (err) {
    return <div className="text-red-400 text-sm" data-testid="trends-error">{err}</div>;
  }

  if (meta.status === "loading" && !pulse && clusters.length === 0) {
    return (
      <div className="text-neutral-500 flex items-center gap-2" data-testid="trends-loading">
        <Loader2 className="animate-spin" size={16} /> Loading {platform} Trends…
      </div>
    );
  }

  if (meta.status === "coming") {
    return (
      <div className="p-8 border border-neutral-900 bg-[#0f0f0f] rounded-sm" data-testid="trends-coming">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Trends · {platform}</div>
        <h2 className="text-xl font-bold mb-2">Platform Trends coming</h2>
        <p className="text-neutral-400 text-sm">{meta.message}</p>
        {meta.lens && <p className="text-neutral-500 text-xs mt-4">Lens: {meta.lens}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="trends-panel">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-yellow-500 mb-1 flex items-center gap-2">
            <Flame size={12} /> {platform === "youtube" ? "Shorts Trends (helper)" : "TikTok Trend Intelligence"}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {platform === "youtube" ? "Optional Shorts context" : "What’s winning right now"}
          </h2>
          <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
            {platform === "youtube"
              ? "Thin helper only — Test is the hero. Use this for format/topic context, not as the main job."
              : <>Pre-flight benchmarks use <span className="text-neutral-200">currently viral / high-performing</span> clips — not flop post-mortems.</>}
          </p>
        </div>
        {meta.as_of && (
          <div className="text-xs text-neutral-500 flex items-center gap-1.5 mono" data-testid="trends-as-of">
            <Clock size={12} /> as_of {new Date(meta.as_of).toLocaleString()}
          </div>
        )}
      </div>

      {pulse?.videos?.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Trending feed</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {pulse.videos.map((v) => (
              <div key={v.id} className="p-4 border border-neutral-900 bg-[#0c0c0c] rounded-sm" data-testid={`trend-video-${v.id}`}>
                <div className="text-sm font-medium text-white mb-2 line-clamp-2">{v.title}</div>
                <div className="text-xs text-neutral-500 flex gap-3">
                  <span>{(v.views || 0).toLocaleString()} views</span>
                  <span>{(v.saves || 0).toLocaleString()} saves</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Angle clusters</div>
          {clusters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              data-testid={`cluster-${c.id}`}
              className={`w-full text-left p-4 border rounded-sm transition-colors ${
                selected?.id === c.id
                  ? "border-yellow-500/60 bg-yellow-500/5"
                  : "border-neutral-900 bg-[#0c0c0c] hover:border-neutral-700"
              }`}
            >
              <div className="font-medium text-sm">{c.angle_label}</div>
              <div className="text-xs text-neutral-500 mt-1">{c.hook_archetype}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="p-6 border border-neutral-900 bg-[#0f0f0f] rounded-sm" data-testid="why-working">
              <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Why it’s working</div>
              <h3 className="text-xl font-bold mb-4">{selected.angle_label}</h3>
              <dl className="space-y-3 text-sm">
                {Object.entries(selected.why_working || {}).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-neutral-500 text-xs uppercase tracking-wider mb-0.5">{k.replace(/_/g, " ")}</dt>
                    <dd className="text-neutral-200">
                      {Array.isArray(v) ? v.join(" · ") : String(v)}
                    </dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-4 py-2.5 rounded-sm text-sm"
                data-testid="use-this-angle-btn"
                onClick={() => alert(`Angle “${selected.angle_label}” will seed Study/Test refine suggestions (Phase 1 stub).`)}
              >
                Use this angle
              </button>
            </div>
          ) : (
            <div className="text-neutral-500 text-sm">Select a cluster</div>
          )}
        </div>
      </div>
    </div>
  );
}
