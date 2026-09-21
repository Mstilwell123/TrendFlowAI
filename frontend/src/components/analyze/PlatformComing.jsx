import React from "react";
import { getPlatform } from "@/lib/platforms";

/** Platform-native empty/stub — NOT the TikTok analyzer reused. */
export default function PlatformComing({ platformId, mode }) {
  const p = getPlatform(platformId);
  return (
    <div
      className="p-8 lg:p-12 border border-neutral-900 bg-[#0f0f0f] rounded-sm max-w-3xl"
      data-testid={`platform-coming-${platformId}`}
    >
      <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">{p.label} · {mode}</div>
      <h2 className="text-2xl font-bold tracking-tight mb-3">{p.label} Analyze engine coming</h2>
      <p className="text-neutral-400 mb-6 leading-relaxed">
        {p.lens}. This menu is a <span className="text-neutral-200">distinct</span> curation and scoring
        surface — we will not reuse the TikTok FYP analyzer here.
      </p>
      <ul className="space-y-2 text-sm text-neutral-400 list-disc list-inside">
        <li>Platform-native Trends pulse & angle clusters</li>
        <li>Platform rubric pack (pre-flight vs winners on {p.label})</li>
        <li>Study / Test / Trends modes scoped to this menu</li>
      </ul>
      <div className="mt-8 text-xs text-neutral-600 uppercase tracking-widest">
        Phase 1 ships TikTok deep · {p.label} shell live
      </div>
    </div>
  );
}
