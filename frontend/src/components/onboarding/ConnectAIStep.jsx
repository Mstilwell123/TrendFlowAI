import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import ConnectAIForm from "../ai/ConnectAIForm";
import { AI_DEFAULTS } from "../ai/aiCatalog";

export default function ConnectAIStep({ onBack, onComplete, loading }) {
  const [form, setForm] = useState({
    ...AI_DEFAULTS,
    perception_api_key: "",
    reason_api_key: "",
    has_perception_key: false,
    has_reason_key: false,
  });
  const [error, setError] = useState("");

  const canFinish =
    form.perception_provider &&
    form.reason_provider &&
    form.perception_model &&
    form.reason_model &&
    form.perception_api_key?.trim() &&
    form.reason_api_key?.trim();

  const handleFinish = async () => {
    setError("");
    if (!canFinish) {
      setError("Add both API keys to finish onboarding.");
      return;
    }
    try {
      await onComplete(form);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Could not complete onboarding");
    }
  };

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Connect your AI.</h1>
      <p className="text-neutral-400 mb-8">
        Step 3 of 3 — bring your own keys. Study &amp; Test bill <em>your</em> providers, never ours.
      </p>

      <ConnectAIForm
        value={form}
        onChange={setForm}
        showSubmit={false}
        compact
        testidPrefix="onboarding-ai"
      />

      {error && (
        <p className="text-sm text-red-400 mt-4" data-testid="onboarding-ai-error">{error}</p>
      )}

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          type="button"
          data-testid="onboarding-ai-back-btn"
          className="border border-neutral-800 hover:border-neutral-600 px-5 py-3 rounded-sm"
        >
          Back
        </button>
        <button
          onClick={handleFinish}
          disabled={loading || !canFinish}
          data-testid="onboarding-finish-btn"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-sm disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />} Enter the app
        </button>
      </div>
    </>
  );
}
