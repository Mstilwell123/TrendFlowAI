import React from "react";
import { Link, useParams } from "react-router-dom";
import { MODES } from "@/lib/platforms";

/** Study | Test | Trends — scoped to the active platform menu. */
export default function ModeTabs() {
  const { platform = "tiktok", mode = "study" } = useParams();

  return (
    <div className="inline-flex border border-neutral-800 rounded-sm overflow-hidden mb-8" data-testid="mode-tabs">
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <Link
            key={m.id}
            to={`/app/${platform}/${m.id}`}
            data-testid={`mode-tab-${m.id}`}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-yellow-500 text-black"
                : "bg-[#0f0f0f] text-neutral-400 hover:text-white"
            }`}
          >
            {m.label}
          </Link>
        );
      })}
    </div>
  );
}
