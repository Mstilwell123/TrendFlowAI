import React from "react";
import ScriptCard from "./ScriptCard";

export default function ScriptsList({ scripts }) {
  if (!scripts?.length) return null;
  return (
    <div className="mb-10" data-testid="scripts-section">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl font-semibold">10 ready-to-film scripts</h2>
        <div className="text-xs text-neutral-500">Each one a distinct hook × format × driver</div>
      </div>
      <div className="space-y-3">
        {scripts.map((s, i) => <ScriptCard key={s.id || `script-${i}`} s={s} idx={i} />)}
      </div>
    </div>
  );
}
