import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Check, KeyRound } from "lucide-react";
import api from "../../lib/api";

import { AI_DEFAULTS, FALLBACK_CATALOG } from "./aiCatalog";
import { RecommendedBadge, SelectField, KeyField } from "./ConnectAIFields";

export { AI_DEFAULTS }; // re-export for ConnectAIStep named import

export default function ConnectAIForm({
  value,
  onChange,
  onSaved,
  submitLabel = "Save AI providers",
  showSubmit = true,
  saving: savingProp,
  onSubmit,
  testidPrefix = "ai",
  compact = false,
}) {
  const controlled = value != null && typeof onChange === "function";
  const [catalog, setCatalog] = useState(FALLBACK_CATALOG);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [internal, setInternal] = useState({
    ...AI_DEFAULTS,
    perception_api_key: "",
    reason_api_key: "",
    has_perception_key: false,
    has_reason_key: false,
  });
  const [savingLocal, setSavingLocal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const form = controlled ? value : internal;
  const setForm = (patch) => {
    if (controlled) onChange({ ...form, ...patch });
    else setInternal((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/ai-config");
        if (cancelled) return;
        if (data?.catalog) {
          setCatalog({
            perception_providers: data.catalog.perception_providers || FALLBACK_CATALOG.perception_providers,
            reason_providers: data.catalog.reason_providers || FALLBACK_CATALOG.reason_providers,
          });
        }
        if (!controlled) {
          setInternal((prev) => ({
            ...prev,
            perception_provider: data.perception_provider || AI_DEFAULTS.perception_provider,
            perception_model: data.perception_model || AI_DEFAULTS.perception_model,
            reason_provider: data.reason_provider || AI_DEFAULTS.reason_provider,
            reason_model: data.reason_model || AI_DEFAULTS.reason_model,
            has_perception_key: !!data.has_perception_key,
            has_reason_key: !!data.has_reason_key,
          }));
        }
      } catch {
        /* use fallback catalog */
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => { cancelled = true; };
  }, [controlled]);

  const perceptionProviders = catalog.perception_providers || [];
  const reasonProviders = catalog.reason_providers || [];

  const perceptionModels = useMemo(() => {
    const p = perceptionProviders.find((x) => x.id === form.perception_provider);
    return p?.models || [];
  }, [perceptionProviders, form.perception_provider]);

  const reasonModels = useMemo(() => {
    const p = reasonProviders.find((x) => x.id === form.reason_provider);
    return p?.models || [];
  }, [reasonProviders, form.reason_provider]);

  const switchPerceptionProvider = (id) => {
    const p = perceptionProviders.find((x) => x.id === id);
    const rec = p?.models?.find((m) => m.recommended) || p?.models?.[0];
    setForm({
      perception_provider: id,
      perception_model: rec?.id || form.perception_model,
    });
  };

  const switchReasonProvider = (id) => {
    const p = reasonProviders.find((x) => x.id === id);
    const rec = p?.models?.find((m) => m.recommended) || p?.models?.[0];
    setForm({
      reason_provider: id,
      reason_model: rec?.id || form.reason_model,
    });
  };

  const saving = savingProp != null ? savingProp : savingLocal;

  const canSubmit = useMemo(() => {
    const percOk = (form.perception_api_key && form.perception_api_key.trim()) || form.has_perception_key;
    const reasonOk = (form.reason_api_key && form.reason_api_key.trim()) || form.has_reason_key;
    return !!(form.perception_provider && form.reason_provider && form.perception_model && form.reason_model && percOk && reasonOk);
  }, [form]);

  const handleSave = async () => {
    setError("");
    if (onSubmit) {
      await onSubmit(form);
      return;
    }
    setSavingLocal(true);
    try {
      const payload = {
        perception_provider: form.perception_provider,
        perception_model: form.perception_model,
        reason_provider: form.reason_provider,
        reason_model: form.reason_model,
      };
      if (form.perception_api_key?.trim()) payload.perception_api_key = form.perception_api_key.trim();
      if (form.reason_api_key?.trim()) payload.reason_api_key = form.reason_api_key.trim();
      const { data } = await api.put("/ai-config", payload);
      if (!controlled) {
        setInternal((prev) => ({
          ...prev,
          ...data,
          perception_api_key: "",
          reason_api_key: "",
        }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved(data);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Failed to save AI config");
    } finally {
      setSavingLocal(false);
    }
  };

  if (loadingMeta) {
    return (
      <div className="flex items-center gap-2 text-neutral-400 text-sm py-6" data-testid={`${testidPrefix}-loading`}>
        <Loader2 size={16} className="animate-spin" /> Loading AI providers…
      </div>
    );
  }

  return (
    <div
      className={compact ? "space-y-5" : "p-6 border border-neutral-900 bg-[#0f0f0f] rounded-sm space-y-6"}
      data-testid={`${testidPrefix}-form`}
    >
      <div className="flex gap-3 items-start">
        <div className="mt-0.5 text-yellow-500"><KeyRound size={18} /></div>
        <div>
          <p className="text-sm text-neutral-300">
            TrendFlow sells the <em>desk</em> — menus, rubrics, Trends, pre-flight UX.
            You bring the compute: your own perception + reason API keys.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            We recommend a strong default pair (badged <span className="text-yellow-500">Recommended</span>).
            Your choice always wins — pick any provider/model for either slot.
          </p>
        </div>
      </div>
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-widest text-neutral-500">
          Perception / vision
          {form.perception_provider === "gemini" && <RecommendedBadge />}
        </legend>
        <SelectField
          label="Provider"
          testid={`${testidPrefix}-perception-provider`}
          value={form.perception_provider}
          onChange={switchPerceptionProvider}
          options={perceptionProviders.map((p) => ({
            id: p.id,
            label: p.recommended ? `${p.label} (Recommended)` : p.label,
          }))}
        />
        <SelectField
          label="Model"
          testid={`${testidPrefix}-perception-model`}
          value={form.perception_model}
          onChange={(id) => setForm({ perception_model: id })}
          options={perceptionModels.map((m) => ({
            id: m.id,
            label: m.recommended ? `${m.label} (Recommended)` : m.label,
          }))}
        />
        <KeyField
          label={form.has_perception_key ? "Perception API key (saved — leave blank to keep)" : "Perception API key"}
          testid={`${testidPrefix}-perception-key`}
          value={form.perception_api_key || ""}
          onChange={(v) => setForm({ perception_api_key: v })}
          placeholder={form.has_perception_key ? "••••••••••••" : "Paste your Gemini API key"}
        />
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-widest text-neutral-500">
          Reason / coach
          {(form.reason_provider === "anthropic" || form.reason_provider === "xai") && <RecommendedBadge />}
        </legend>
        <SelectField
          label="Provider"
          testid={`${testidPrefix}-reason-provider`}
          value={form.reason_provider}
          onChange={switchReasonProvider}
          options={reasonProviders.map((p) => ({
            id: p.id,
            label: p.recommended ? `${p.label} (Recommended)` : p.label,
          }))}
        />
        <SelectField
          label="Model"
          testid={`${testidPrefix}-reason-model`}
          value={form.reason_model}
          onChange={(id) => setForm({ reason_model: id })}
          options={reasonModels.map((m) => ({
            id: m.id,
            label: m.recommended ? `${m.label} (Recommended)` : m.label,
          }))}
        />
        <KeyField
          label={form.has_reason_key ? "Reason API key (saved — leave blank to keep)" : "Reason API key"}
          testid={`${testidPrefix}-reason-key`}
          value={form.reason_api_key || ""}
          onChange={(v) => setForm({ reason_api_key: v })}
          placeholder={
            form.has_reason_key
              ? "••••••••••••"
              : form.reason_provider === "xai"
                ? "Paste your xAI API key"
                : "Paste your Anthropic API key"
          }
        />
      </fieldset>

      {error && (
        <p className="text-sm text-red-400" data-testid={`${testidPrefix}-error`}>{error}</p>
      )}

      {showSubmit && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSubmit}
            data-testid={`${testidPrefix}-save-btn`}
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-5 py-2.5 rounded-sm disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {submitLabel}
          </button>
          {saved && (
            <span className="text-sm text-green-400 inline-flex items-center gap-1" data-testid={`${testidPrefix}-saved`}>
              <Check size={14} /> Saved
            </span>
          )}
        </div>
      )}
    </div>
  );
}
