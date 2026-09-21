import React from "react";
import ComponentRow from "./ComponentRow";
import { isShortsPlatform, SHORTS_SCORE_MAX } from "../../lib/shortsRubric";

export default function ComponentsTable({ components, platform }) {
  if (!components?.length) return null;
  const shorts = isShortsPlatform(platform);
  const scoreMax = shorts ? SHORTS_SCORE_MAX : 10;
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">
        {shorts ? "Shorts pre-flight scorecard" : "10-component teardown"}
      </h2>
      <div className="border border-neutral-900 bg-[#0f0f0f] rounded-sm">
        <div className="px-5 grid grid-cols-12 gap-3 py-3 border-b border-neutral-900 text-xs uppercase tracking-widest text-neutral-500">
          <div className="col-span-12 sm:col-span-4">Component</div>
          <div className="col-span-3 sm:col-span-1">Score</div>
          <div className="col-span-9 sm:col-span-2">Percentile</div>
          <div className="col-span-12 sm:col-span-5">Observation</div>
        </div>
        <div className="px-5">
          {components.map((c) => (
            <ComponentRow key={c.id} c={c} scoreMax={scoreMax} />
          ))}
        </div>
      </div>
    </div>
  );
}
