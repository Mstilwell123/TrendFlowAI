import React from "react";

export default function TestMetadataForm({ title, setTitle, duration, setDuration, description, setDescription }) {
  return (
    <div className="p-6 lg:p-8 border border-neutral-900 bg-[#0f0f0f] rounded-sm space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label="Draft title"
          testid="test-title-input"
          value={title}
          onChange={setTitle}
          placeholder="Working title"
        />
        <Field
          label="Duration (sec, if no upload)"
          testid="test-duration-input"
          type="number" min="8" max="180"
          value={duration}
          onChange={setDuration}
        />
      </div>
      <Field
        label="Notes (optional)"
        testid="test-description-input"
        textarea
        rows={3}
        value={description}
        onChange={setDescription}
        placeholder="Anything that helps us judge — e.g. 'this is a re-edit, hook tightened from 5s to 2s, added a pattern interrupt at 0:12'"
      />
    </div>
  );
}

function Field({ label, testid, value, onChange, placeholder, type = "text", textarea, rows, min, max }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          rows={rows} placeholder={placeholder}
          data-testid={testid}
          className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      ) : (
        <input
          type={type} min={min} max={max}
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={testid}
          className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      )}
    </div>
  );
}
