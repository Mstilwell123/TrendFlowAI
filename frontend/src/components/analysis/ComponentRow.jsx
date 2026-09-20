import React from "react";

const SCORE_COLOR = (s) =>
  s >= 8 ? "text-green-400" :
  s >= 6 ? "text-lime-400" :
  s >= 4 ? "text-yellow-500" :
  s >= 2 ? "text-orange-400" : "text-red-400";

export default function ComponentRow({ c }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-3 border-b border-neutral-900 items-start" data-testid={`comp-${c.id}`}>
      <div className="col-span-12 sm:col-span-4">
        <div className="text-sm font-semibold">{c.name}</div>
        <div className="text-xs mono text-neutral-500 mt-1">{c.evidence_ts || "—"}</div>
      </div>
      <div className="col-span-3 sm:col-span-1 flex flex-col items-start">
        <div className={`text-2xl font-bold ${SCORE_COLOR(c.score)}`}>{c.score}</div>
        <div className="text-xs text-neutral-500">/10</div>
      </div>
      <div className="col-span-9 sm:col-span-2 flex items-center">
        <div className="w-full">
          <div className="text-xs text-neutral-500 mb-1">P{c.percentile_vs_niche ?? "—"}</div>
          <div className="h-1.5 bg-neutral-900 rounded-sm overflow-hidden">
            <div className="h-full bg-yellow-500" style={{ width: `${c.percentile_vs_niche || 0}%` }} />
          </div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-5 text-sm text-neutral-300 leading-relaxed">{c.note}</div>
    </div>
  );
}
