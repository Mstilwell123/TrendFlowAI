import React from "react";
import { Loader2 } from "lucide-react";
import { STATUS_LABELS } from "../../lib/constants";

const STAGES = ["downloading", "perceiving", "analyzing", "generating", "done"];

export default function AnalysisProgress({ status, progress }) {
  return (
    <div className="mb-8 p-5 border border-neutral-900 bg-[#0f0f0f] rounded-sm" data-testid="analysis-progress">
      <div className="flex items-center gap-3 mb-3">
        <Loader2 size={16} className="animate-spin text-yellow-500" />
        <span className="text-sm font-medium">{STATUS_LABELS[status] || status}…</span>
        <span className="text-xs text-neutral-500 ml-auto">{progress}%</span>
      </div>
      <div className="h-1 bg-neutral-900 rounded-sm overflow-hidden">
        <div className="h-full bg-yellow-500 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-5 gap-2 mt-4 text-xs">
        {STAGES.map((s) => (
          <div key={s} className={`px-2 py-1 rounded-sm text-center uppercase tracking-widest ${
            status === s ? "bg-yellow-500/10 text-yellow-500" : "text-neutral-600"
          }`}>{s}</div>
        ))}
      </div>
    </div>
  );
}
