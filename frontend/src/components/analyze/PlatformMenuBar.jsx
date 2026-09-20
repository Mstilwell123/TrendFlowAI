import React from "react";
import { Link, useParams } from "react-router-dom";
import { PLATFORMS } from "@/lib/platforms";

/**
 * Desktop primary menu: TikTok | YouTube | Instagram | Facebook
 * Each menu is a distinct curation/scoring engine — not a dropdown on one analyzer.
 */
export default function PlatformMenuBar({ mode = "study" }) {
  const { platform } = useParams();
  const active = platform || "tiktok";

  return (
    <div className="border-b border-neutral-900 mb-6" data-testid="platform-menu-bar">
      <div className="flex items-center gap-1 overflow-x-auto">
        {PLATFORMS.map((p) => {
          const isActive = active === p.id;
          const href = `/app/${p.id}/${mode}`;
          return (
            <Link
              key={p.id}
              to={href}
              data-testid={`platform-tab-${p.id}`}
              className={`relative px-5 py-3 text-sm font-medium tracking-wide whitespace-nowrap transition-colors ${
                isActive
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {p.label}
              {p.status === "coming" && (
                <span className="ml-2 text-[10px] uppercase tracking-widest text-neutral-600">soon</span>
              )}
              {isActive && (
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-yellow-500" />
              )}
            </Link>
          );
        })}
      </div>
      <p className="px-1 pt-3 pb-1 text-xs text-neutral-500 max-w-3xl">
        Each platform is its own trend & scoring engine. Same offer, re-curated per menu — not one shared analyzer.
      </p>
    </div>
  );
}
