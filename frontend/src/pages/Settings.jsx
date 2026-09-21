import React, { useState } from "react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import BrandProfileForm from "../components/settings/BrandProfileForm";
import SubscriptionTiers from "../components/settings/SubscriptionTiers";
import ConnectAIForm from "../components/ai/ConnectAIForm";

function joinLines(arr) {
  return (arr || []).join("\n");
}
function joinCsv(arr) {
  return (arr || []).join(", ");
}
function splitCsv(s) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}
function splitLines(s) {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

export default function Settings() {
  const { user, refresh } = useAuth();
  const [niche, setNiche] = useState(user?.niche || "");
  const [tone, setTone] = useState(user?.brand_voice?.tone || "");
  const [banned, setBanned] = useState(joinCsv(user?.brand_voice?.banned_phrases));
  const [samples, setSamples] = useState(joinLines(user?.brand_voice?.sample_lines));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      await api.post("/profile", {
        niche,
        brand_voice: {
          tone,
          banned_phrases: splitCsv(banned),
          sample_lines: splitLines(samples),
        },
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-12 max-w-4xl mx-auto" data-testid="settings-page">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Settings</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your studio.</h1>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Brand profile</h2>
        <BrandProfileForm
          niche={niche} setNiche={setNiche}
          tone={tone} setTone={setTone}
          banned={banned} setBanned={setBanned}
          samples={samples} setSamples={setSamples}
          onSave={save} saving={saving} saved={saved}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">AI providers</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Edit perception + reason providers and keys anytime. Study/Test always use <em>your</em> keys.
        </p>
        <ConnectAIForm
          testidPrefix="settings-ai"
          submitLabel="Save AI providers"
          onSaved={() => refresh()}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
        <SubscriptionTiers currentTier={user?.subscription_tier || "free"} />
      </section>
    </div>
  );
}
