import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import ScorecardOverview from "../components/analysis/ScorecardOverview";
import ComponentsTable from "../components/analysis/ComponentsTable";
import ScriptsList from "../components/analysis/ScriptsList";
import AlignmentBreakdown from "../components/analysis/AlignmentBreakdown";
import { PublicHeader, PublicTitleBar, PublicReportCTA } from "../components/public/PublicChrome";

const PUBLIC_API = `${process.env.REACT_APP_BACKEND_URL}/api/public`;

function usePublicReport(slug) {
  const [a, setA] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios.get(`${PUBLIC_API}/r/${slug}`)
      .then((r) => { if (!cancelled) setA(r.data); })
      .catch((e) => { if (!cancelled) setErr(e?.response?.data?.detail || "Report not found"); });
    return () => { cancelled = true; };
  }, [slug]);

  return { a, err };
}

function PublicErrorView({ err }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="text-center max-w-md" data-testid="public-error">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
          <div className="text-xl font-semibold mb-2">{err}</div>
          <p className="text-sm text-neutral-400 mb-6">This report may have been made private or never existed.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
            Visit TrendFlow <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PublicLoadingView() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-neutral-500 flex items-center justify-center"
      data-testid="public-loading"
    >
      <Loader2 size={28} className="animate-spin text-yellow-500" />
    </div>
  );
}

export default function PublicReport() {
  const { slug } = useParams();
  const { a, err } = usePublicReport(slug);

  if (err) return <PublicErrorView err={err} />;
  if (!a) return <PublicLoadingView />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" data-testid="public-report">
      <PublicHeader />
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10">
        <PublicTitleBar analysis={a} />
        <ScorecardOverview analysis={a} showSourceBadge={false} />
        <ComponentsTable components={a.scorecard?.components} />
        {a.mode === "test" && a.alignment && <AlignmentBreakdown alignment={a.alignment} />}
        {a.mode === "study" && <ScriptsList scripts={a.scripts} />}
        <PublicReportCTA />
      </div>
    </div>
  );
}
