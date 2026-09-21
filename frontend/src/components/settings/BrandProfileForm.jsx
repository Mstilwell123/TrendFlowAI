import React from "react";
import { Loader2, Check } from "lucide-react";
import { NICHES } from "../../lib/constants";

export default function BrandProfileForm({ niche, setNiche, tone, setTone, banned, setBanned, samples, setSamples, onSave, saving, saved }) {
  return (
    <div className="p-6 border border-neutral-900 bg-[#0f0f0f] rounded-sm space-y-5">
      <NicheField value={niche} onChange={setNiche} />
      <TextField
        label="Tone" testid="settings-tone-input"
        value={tone} onChange={setTone}
      />
      <TextField
        label="Banned phrases (comma-separated)" testid="settings-banned-input"
        value={banned} onChange={setBanned}
      />
      <TextareaField
        label="Sample lines (1 per line)" testid="settings-samples-input"
        value={samples} onChange={setSamples} rows={4}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={onSave} disabled={saving}
          data-testid="settings-save-btn"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-5 py-2.5 rounded-sm disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />} Save changes
        </button>
        {saved && (
          <span className="text-sm text-green-400 inline-flex items-center gap-1" data-testid="settings-saved">
            <Check size={14} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

function NicheField({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Niche</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        data-testid="settings-niche-select"
        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
      >
        {NICHES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
      </select>
    </div>
  );
}

function TextField({ label, testid, value, onChange }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
    </div>
  );
}

function TextareaField({ label, testid, value, onChange, rows }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        data-testid={testid}
        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
    </div>
  );
}
