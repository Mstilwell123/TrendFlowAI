import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { NICHES } from "../../lib/constants";

export default function NicheStep({ value, onChange, onNext }) {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">What&apos;s your niche?</h1>
      <p className="text-neutral-400 mb-8">We&apos;ll benchmark against viral outliers in your space.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {NICHES.map((n) => (
          <NicheButton key={n.id} niche={n} selected={value === n.id} onClick={() => onChange(n.id)} />
        ))}
      </div>
      <button
        onClick={onNext} disabled={!value}
        data-testid="onboarding-next-btn"
        className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-medium px-6 py-3 rounded-sm"
      >
        Next <ArrowRight size={16} />
      </button>
    </>
  );
}

function NicheButton({ niche, selected, onClick }) {
  return (
    <button
      type="button" onClick={onClick}
      data-testid={`niche-${niche.id}`}
      className={`px-4 py-3 rounded-sm text-sm border transition-colors text-left ${
        selected
          ? "border-yellow-500 bg-yellow-500/10 text-white"
          : "border-neutral-800 hover:border-neutral-600 text-neutral-300"
      }`}
    >
      <span className="flex items-center justify-between">
        {niche.label}
        {selected && <Check size={14} className="text-yellow-500" />}
      </span>
    </button>
  );
}
