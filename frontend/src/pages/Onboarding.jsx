import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import api from "../lib/api";
import Logo from "../components/Logo";
import NicheStep from "../components/onboarding/NicheStep";
import BrandVoiceStep from "../components/onboarding/BrandVoiceStep";
import ConnectAIStep from "../components/onboarding/ConnectAIStep";

export default function Onboarding() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState(user?.niche || "");
  const [tone, setTone] = useState("confident, conversational, no-fluff");
  const [bannedRaw, setBannedRaw] = useState("");
  const [samples, setSamples] = useState("");
  const [loading, setLoading] = useState(false);

  const brandVoice = () => ({
    tone,
    banned_phrases: bannedRaw.split(",").map((s) => s.trim()).filter(Boolean),
    sample_lines: samples.split("\n").map((s) => s.trim()).filter(Boolean),
  });

  /** Step 2 Continue — save niche+brand WITHOUT onboarded; go to step 3. */
  const continueToAI = async () => {
    setLoading(true);
    try {
      await api.post("/profile", {
        niche,
        brand_voice: brandVoice(),
        // complete_onboarding intentionally omitted / false
      });
      await refresh();
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  /** Step 3 — save AI keys, then complete onboarding (sets onboarded: true). */
  const finishWithAI = async (aiForm) => {
    setLoading(true);
    try {
      // Ensure niche/brand persisted (idempotent)
      await api.post("/profile", {
        niche,
        brand_voice: brandVoice(),
      });
      await api.put("/ai-config", {
        perception_provider: aiForm.perception_provider,
        perception_model: aiForm.perception_model,
        reason_provider: aiForm.reason_provider,
        reason_model: aiForm.reason_model,
        perception_api_key: aiForm.perception_api_key,
        reason_api_key: aiForm.reason_api_key,
      });
      await api.post("/onboarding/complete");
      await refresh();
      nav("/app");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="px-5 py-5"><Logo /></div>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-yellow-500 mb-3">Step {step} of 3</div>
          {step === 1 && (
            <NicheStep value={niche} onChange={setNiche} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <BrandVoiceStep
              tone={tone} setTone={setTone}
              bannedRaw={bannedRaw} setBannedRaw={setBannedRaw}
              samples={samples} setSamples={setSamples}
              onBack={() => setStep(1)}
              onSubmit={continueToAI}
              loading={loading}
              submitLabel="Continue"
            />
          )}
          {step === 3 && (
            <ConnectAIStep
              onBack={() => setStep(2)}
              onComplete={finishWithAI}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
