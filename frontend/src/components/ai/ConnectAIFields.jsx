import React from "react";
import { Sparkles } from "lucide-react";

export function RecommendedBadge() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-yellow-500 border border-yellow-500/40 px-1.5 py-0.5 rounded-sm">
      <Sparkles size={10} /> Recommended
    </span>
  );
}

export function SelectField({ label, testid, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function KeyField({ label, testid, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      <input
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        placeholder={placeholder}
        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono text-sm"
      />
    </div>
  );
}
