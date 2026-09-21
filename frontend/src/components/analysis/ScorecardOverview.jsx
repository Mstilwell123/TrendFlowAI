import React from "react";
import AlignmentGauge from "../AlignmentGauge";

/**
 * Top-of-report block: gauge + structural read + perception summary.
 * Used by both AnalysisView and PublicReport.
 */
export default function ScorecardOverview({ analysis, showSourceBadge = true }) {
  const sc = analysis.scorecard;
  if (!sc) return null;

  const useAlignment = analysis.mode === "test" && analysis.alignment;
  const score = useAlignment ? analysis.alignment.composite : (sc.composite || 0);
  const band = useAlignment ? analysis.alignment.band : "Composite";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      <div className="lg:col-span-1 p-6 border border-neutral-900 bg-[#0f0f0f] rounded-sm flex flex-col items-center justify-center">
        <AlignmentGauge score={score} band={band} />
        <div className="text-xs text-neutral-500 mt-4 uppercase tracking-widest">
          Outlier × {(analysis.outlier_multiplier || 1).toFixed(1)}
        </div>
      </div>
      <div className="lg:col-span-2 p-6 border border-neutral-900 bg-[#0f0f0f] rounded-sm">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-3">Structural read</div>
        <p className="text-base leading-relaxed text-neutral-200" data-testid="analysis-summary">{sc.summary}</p>
        {analysis.perception?.summary && (
          <PerceptionSummary perception={analysis.perception} showSourceBadge={showSourceBadge} />
        )}
      </div>
    </div>
  );
}

function PerceptionSummary({ perception, showSourceBadge }) {
  return (
    <>
      <div className="text-xs uppercase tracking-widest text-neutral-500 mt-6 mb-2 flex items-center gap-2">
        Perception summary
        {showSourceBadge && perception._source === "video_file" && (
          <span
            className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-sm uppercase tracking-widest"
            data-testid="perception-source-video"
          >video</span>
        )}
        {showSourceBadge && perception._source === "metadata_heuristic" && (
          <span
            className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded-sm uppercase tracking-widest"
            data-testid="perception-source-meta"
          >heuristic</span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-neutral-400" data-testid="perception-summary">
        {perception.summary}
      </p>
    </>
  );
}
