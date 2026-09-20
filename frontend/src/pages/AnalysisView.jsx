import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft, Check } from "lucide-react";
import api from "../lib/api";
import ComponentsTable from "../components/analysis/ComponentsTable";
import ScriptsList from "../components/analysis/ScriptsList";
import AnalysisProgress from "../components/analysis/AnalysisProgress";
import AlignmentBreakdown from "../components/analysis/AlignmentBreakdown";
import AnalysisHeader, { AnalysisFailed, BackLink } from "../components/analysis/AnalysisHeader";
import ScorecardOverview from "../components/analysis/ScorecardOverview";
import AngleVsTrend from "../components/trends/AngleVsTrend";

const POLL_INTERVAL_MS = 2500;
const TERMINAL_STATUSES = ["done", "failed"];

function useAnalysisPolling(id) {
  const [a, setA] = useState(null);
  const [err, setErr] = useState("");
  const pollRef = useRef(null);
  const cancelledRef = useRef(false);

  const fetchOnce = useCallback(async () => {
    try {
      const { data } = await api.get(`/analysis/${id}`);
      if (cancelledRef.current) return;
      setA(data);
      if (!TERMINAL_STATUSES.includes(data.status)) {
        pollRef.current = setTimeout(fetchOnce, POLL_INTERVAL_MS);
      }
    } catch (e) {
      if (cancelledRef.current) return;
      setErr(e?.response?.data?.detail || "Not found");
    }
  }, [id]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchOnce();
    return () => {
      cancelledRef.current = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [fetchOnce]);

  const patch = useCallback((fields) => setA((prev) => prev ? { ...prev, ...fields } : prev), []);

  return { a, err, patch };
}

function ErrorView({ err }) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16 text-center" data-testid="analysis-error">
      <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
      <div className="text-xl font-semibold">{err}</div>
      <Link to="/app" className="inline-flex items-center gap-2 mt-6 text-yellow-500" data-testid="analysis-back-link">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16 text-center text-neutral-500" data-testid="analysis-loading">
      <Loader2 size={28} className="animate-spin mx-auto mb-4 text-yellow-500" /> Loading…
    </div>
  );
}

function TestModeActions() {
  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-3" data-testid="alignment-actions">
      <Link
        to="/app/tiktok/test"
        className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-5 py-3 rounded-sm"
        data-testid="retest-btn"
      >
        <Check size={16} /> Re-test after edit
      </Link>
      <Link to="/app/tiktok/study" className="inline-flex items-center gap-2 border border-neutral-800 hover:border-neutral-600 text-white px-5 py-3 rounded-sm">
        Study a similar viral
      </Link>
    </div>
  );
}


function SwarmExportStub({ analysisId }) {
  const [msg, setMsg] = useState("");
  const send = async () => {
    setMsg("");
    try {
      await api.post("/export/swarm-command", { analysis_id: analysisId });
    } catch (e) {
      const d = e?.response?.data?.detail;
      setMsg(typeof d === "string" ? d : "Export not available (501 stub).");
    }
  };
  return (
    <div className="mt-8 p-5 border border-neutral-900 rounded-sm bg-[#0c0c0c]" data-testid="swarm-export-stub">
      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Swarm Command</div>
      <button
        type="button"
        onClick={send}
        className="inline-flex items-center gap-2 border border-neutral-700 hover:border-yellow-500 text-sm px-4 py-2.5 rounded-sm"
        data-testid="send-to-command-btn"
      >
        Send to Swarm Command
      </button>
      {msg && <p className="text-xs text-neutral-500 mt-3 max-w-2xl">{msg}</p>}
    </div>
  );
}

export default function AnalysisView() {
  const { id } = useParams();
  const { a, err, patch } = useAnalysisPolling(id);

  if (err) return <ErrorView err={err} />;
  if (!a) return <LoadingView />;

  const inFlight = !TERMINAL_STATUSES.includes(a.status);

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-12 max-w-7xl mx-auto" data-testid="analysis-page">
      <BackLink />
      <AnalysisHeader a={a} onUpdated={patch} />
      {inFlight && <AnalysisProgress status={a.status} progress={a.progress} />}
      {a.status === "failed" && <AnalysisFailed error={a.error} />}
      <ScorecardOverview analysis={a} />
      <ComponentsTable components={a.scorecard?.components} />
      {a.mode === "test" && a.alignment && <AlignmentBreakdown alignment={a.alignment} />}
      {a.mode === "study" && <ScriptsList scripts={a.scripts} />}
      {a.status === "done" && (
        <AngleVsTrend comparison={a.trend_comparison} detectedAngle={a.detected_angle} />
      )}
      {a.status === "done" && <SwarmExportStub analysisId={a.id} />}
      {a.mode === "test" && a.status === "done" && <TestModeActions />}
    </div>
  );
}
