import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ScriptCard({ s, idx }) {
  const [open, setOpen] = useState(idx < 2);
  const beatKey = (b, i) => `${s.id || idx}-${b.t || ""}-${i}`;

  return (
    <div className="border border-neutral-900 bg-[#0f0f0f] rounded-sm overflow-hidden" data-testid={`script-${idx + 1}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-start justify-between gap-4 hover:bg-neutral-900/50 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="mono text-xs text-yellow-500">#{String(idx + 1).padStart(2, "0")}</span>
            <span className="text-xs uppercase tracking-widest text-neutral-500">{s.hook_archetype}</span>
            <span className="text-xs text-neutral-600">·</span>
            <span className="text-xs text-neutral-400">{s.format}</span>
            <span className="text-xs text-neutral-600">·</span>
            <span className="text-xs text-neutral-400">{s.emotional_driver}</span>
          </div>
          <div className="text-base font-semibold truncate">
            {s.title || s.beats?.[0]?.vo?.slice(0, 80) || "Script"}
          </div>
        </div>
        {open
          ? <ChevronUp size={18} className="text-neutral-500 flex-shrink-0 mt-1" />
          : <ChevronDown size={18} className="text-neutral-500 flex-shrink-0 mt-1" />
        }
      </button>
      {open && (
        <div className="border-t border-neutral-900">
          <div className="px-5 py-3 text-xs text-neutral-500 grid grid-cols-12 gap-2 border-b border-neutral-900 uppercase tracking-widest">
            <div className="col-span-1">Time</div>
            <div className="col-span-2">Beat</div>
            <div className="col-span-4">Voiceover</div>
            <div className="col-span-3">On-Screen Text</div>
            <div className="col-span-2">Shot / Audio</div>
          </div>
          {(s.beats || []).map((b, i) => (
            <div key={beatKey(b, i)} className="px-5 py-3 grid grid-cols-12 gap-2 border-b border-neutral-900 text-sm">
              <div className="col-span-1 mono text-yellow-500">{b.t}</div>
              <div className="col-span-2 text-neutral-300">{b.label}</div>
              <div className="col-span-4 text-white">{b.vo}</div>
              <div className="col-span-3 text-neutral-300">{b.on_screen_text}</div>
              <div className="col-span-2 text-neutral-400 text-xs">
                <div>{b.shot}</div>
                <div className="text-neutral-500 mt-1">{b.audio}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
