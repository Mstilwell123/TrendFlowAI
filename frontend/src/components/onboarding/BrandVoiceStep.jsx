import React from "react";
import { Loader2 } from "lucide-react";

export default function BrandVoiceStep({ tone, setTone, bannedRaw, setBannedRaw, samples, setSamples, onBack, onSubmit, loading, submitLabel = "Continue" }) {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Tell us your brand voice.</h1>
      <p className="text-neutral-400 mb-8">We use this to keep generated scripts sounding like <em>you</em>.</p>
      <div className="space-y-5 mb-8">
        <TextField
          label="Tone descriptors" testid="onboarding-tone-input"
          value={tone} onChange={setTone}
          placeholder="e.g. dry, witty, technical"
        />
        <TextField
          label="Banned phrases (comma-separated)" testid="onboarding-banned-input"
          value={bannedRaw} onChange={setBannedRaw}
          placeholder="e.g. literally, game-changer, hustle"
        />
        <TextareaField
          label="Sample lines (1 per line)" testid="onboarding-samples-input"
          value={samples} onChange={setSamples} rows={4}
          placeholder={"A line you'd actually say\nAnother one"}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack} type="button"
          data-testid="onboarding-back-btn"
          className="border border-neutral-800 hover:border-neutral-600 px-5 py-3 rounded-sm"
        >
          Back
        </button>
        <button
          onClick={onSubmit} disabled={loading}
          data-testid="onboarding-brand-continue-btn"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-sm disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />} {submitLabel}
        </button>
      </div>
    </>
  );
}

function TextField({ label, testid, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        data-testid={testid} placeholder={placeholder}
        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
    </div>
  );
}

function TextareaField({ label, testid, value, onChange, rows, placeholder }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        data-testid={testid} placeholder={placeholder}
        className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
    </div>
  );
}
