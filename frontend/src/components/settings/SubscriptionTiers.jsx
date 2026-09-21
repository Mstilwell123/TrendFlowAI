import React from "react";
import { TIERS } from "../../lib/constants";

export default function SubscriptionTiers({ currentTier }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {TIERS.map((t) => (
          <TierCard key={t.id} tier={t} isCurrent={currentTier === t.id} />
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-3">
        Stripe billing integration coming soon. Plans are illustrative for now.
      </p>
    </>
  );
}

function TierCard({ tier, isCurrent }) {
  return (
    <div
      data-testid={`settings-tier-${tier.id}`}
      className={`p-5 border rounded-sm ${isCurrent ? "border-yellow-500 bg-[#141005]" : "border-neutral-900 bg-[#101010]"}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-base font-semibold">{tier.name}</div>
        {isCurrent && <span className="text-xs text-yellow-500 uppercase tracking-widest">Current</span>}
      </div>
      <div className="text-2xl font-bold mb-2">
        ${tier.price}
        <span className="text-xs text-neutral-500 font-normal">/mo</span>
      </div>
      <div className="text-xs text-neutral-400 mb-3">{tier.tagline}</div>
      <button
        disabled={isCurrent}
        data-testid={`settings-upgrade-${tier.id}`}
        className={`w-full text-xs py-2 rounded-sm ${
          isCurrent
            ? "border border-neutral-800 text-neutral-500 cursor-default"
            : "bg-yellow-500 hover:bg-yellow-400 text-black"
        }`}
        title={isCurrent ? "Current plan" : "Stripe integration coming soon"}
      >
        {isCurrent ? "Current" : "Upgrade"}
      </button>
    </div>
  );
}
