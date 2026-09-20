import React from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";

/** Your angle vs the trend — shown on Study/Test results (pre-flight vs winners). */
export default function AngleVsTrend({ comparison, detectedAngle }) {
  if (!comparison) return null;
  const matched = comparison.matched_clusters || [];
  const gaps = comparison.gaps || [];

  return (
    <div className="mt-10 p-6 lg:p-8 border border-neutral-900 bg-[#0f0f0f] rounded-sm" data-testid="angle-vs-trend">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-yellow-500 mb-1 flex items-center gap-2">
            <TrendingUp size={12} /> Your angle vs the trend
          </div>
          <h3 className="text-xl font-bold tracking-tight">Pre-flight vs today’s winners</h3>
          {detectedAngle && (
            <p className="text-sm text-neutral-400 mt-1">
              Detected draft angle: <span className="text-neutral-200">{detectedAngle}</span>
            </p>
          )}
        </div>
        {comparison.as_of && (
          <div className="text-xs text-neutral-500 mono">as_of {new Date(comparison.as_of).toLocaleString()}</div>
        )}
      </div>

      {comparison.preflight_vs_winners && (
        <p className="text-neutral-300 text-sm leading-relaxed mb-6 border-l-2 border-yellow-500/50 pl-4">
          {comparison.preflight_vs_winners}
        </p>
      )}

      {matched.length > 0 && (
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Nearest winning clusters</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {matched.slice(0, 3).map((m) => (
              <div key={m.cluster_id || m.angle_label} className="p-4 border border-neutral-800 bg-[#0c0c0c] rounded-sm">
                <div className="font-medium text-sm">{m.angle_label}</div>
                <div className="text-xs text-yellow-500 mt-1">{m.similarity}% match</div>
                {m.note && <p className="text-xs text-neutral-500 mt-2">{m.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {gaps.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
            <AlertTriangle size={12} /> Gaps vs winners
          </div>
          <ul className="space-y-2">
            {gaps.map((g, i) => (
              <li key={i} className="text-sm text-neutral-300 flex gap-2">
                <span className="text-yellow-500 mono">{String(i + 1).padStart(2, "0")}</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
