import React from "react";
import { weakestTwo, SHORTS_SCORE_MAX } from "../../lib/shortsRubric";

/** Shorts v1: surface weakest 2 fields as fix-these-first. */
export default function FixTheseFirst({ components, platform }) {
  if ((platform || "").toLowerCase() !== "youtube") return null;
  const weak = weakestTwo(components);
  if (!weak.length) return null;
  return (
    <div
      className="mb-8 p-5 border border-yellow-500/40 bg-yellow-500/5 rounded-sm"
      data-testid="fix-these-first"
    >
      <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Fix these first</div>
      <p className="text-sm text-neutral-300 mb-4">
        Weakest levers on this Short — rewrite these before upload.
      </p>
      <ul className="space-y-3">
        {weak.map((c) => (
          <li key={c.id} className="flex gap-4 items-start" data-testid={`fix-first-${c.id}`}>
            <div className="text-2xl font-bold text-yellow-500 tabular-nums min-w-[3rem]">
              {c.score}
              <span className="text-xs text-neutral-500 font-normal">/{SHORTS_SCORE_MAX}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{c.name}</div>
              <div className="text-sm text-neutral-400 mt-1 leading-relaxed">
                {c.note || c.guidance || "Tighten this before you post."}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
