import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import AlignmentGauge from "../components/AlignmentGauge";
import Logo from "../components/Logo";

const PUBLIC_API = `${process.env.REACT_APP_BACKEND_URL}/api/public`;

function useEmbedReport(slug) {
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

const SCORE_COLOR = (s) =>
  s >= 8 ? "text-green-400" :
  s >= 6 ? "text-lime-400" :
  s >= 4 ? "text-yellow-500" :
  s >= 2 ? "text-orange-400" : "text-red-400";

function EmbedHeader({ niche }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-900 bg-[#0a0a0a]">
      <Logo />
      {niche && (
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">{niche}</span>
      )}
    </div>
  );
}

function EmbedTitle({ analysis }) {
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span
          className={`text-[10px] uppercase tracking-widest ${analysis.mode === "study" ? "text-yellow-500" : "text-lime-400"}`}
          data-testid="embed-mode"
        >
          {analysis.mode === "study" ? "Study" : "Test"}
        </span>
        <span className="text-neutral-700">·</span>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">{analysis.platform || "—"}</span>
      </div>
      <h2 className="text-base font-semibold truncate" data-testid="embed-title">
        {analysis.title || "Untitled video"}
      </h2>
    </div>
  );
}

function EmbedGaugeRow({ analysis }) {
  const sc = analysis.scorecard;
  const useAlignment = analysis.mode === "test" && analysis.alignment;
  const score = useAlignment ? analysis.alignment.composite : (sc?.composite || 0);
  const band = useAlignment ? analysis.alignment.band : "Composite";
  return (
    <div className="px-4 py-3 flex items-center gap-4 border-b border-neutral-900">
      <AlignmentGauge score={score} band={band} size={130} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-yellow-500 mb-1">Structural read</div>
        <p className="text-xs leading-snug text-neutral-300 line-clamp-4" data-testid="embed-summary">
          {sc?.summary || "—"}
        </p>
      </div>
    </div>
  );
}

function EmbedComponentsCompact({ components }) {
  if (!components?.length) return null;
  return (
    <div className="px-4 py-3" data-testid="embed-components">
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">10-component teardown</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {components.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-900/60">
            <span className="text-neutral-300 truncate pr-2">{c.name}</span>
            <span className={`mono font-semibold flex-shrink-0 ${SCORE_COLOR(c.score)}`}>
              {c.score}<span className="text-neutral-600">/10</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmbedAlignmentRow({ alignment }) {
  if (!alignment) return null;
  const sections = [
    { key: "good", label: "Good", color: "text-green-400", field: "note", count: alignment.good?.length || 0 },
    { key: "bad", label: "Bad", color: "text-yellow-400", field: "fix", count: alignment.bad?.length || 0 },
    { key: "ugly", label: "Ugly", color: "text-red-400", field: "fix", count: alignment.ugly?.length || 0 },
  ];
  return (
    <div className="px-4 py-3 grid grid-cols-3 gap-2 border-t border-neutral-900" data-testid="embed-alignment">
      {sections.map((s) => (
        <div key={s.key} className="text-center">
          <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function EmbedFooter({ slug }) {
  const fullUrl = `${window.location.origin}/r/${slug}`;
  return (
    <div className="px-4 py-3 border-t border-yellow-500/30 bg-yellow-500/5 flex items-center justify-between gap-3" data-testid="embed-footer">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-yellow-500 mb-0.5">Powered by TrendFlow</div>
        <div className="text-xs text-neutral-400 truncate">10 scripts in your voice — free</div>
      </div>
      <a
        href={fullUrl} target="_top" rel="noreferrer"
        data-testid="embed-cta"
        className="inline-flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-medium px-3 py-1.5 rounded-sm flex-shrink-0"
      >
        View full <ArrowRight size={12} />
      </a>
    </div>
  );
}

function EmbedError({ err }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-5 text-center" data-testid="embed-error">
      <AlertCircle size={24} className="text-red-400 mb-2" />
      <div className="text-sm font-semibold mb-1">{err}</div>
      <Link to="/" target="_top" className="text-xs text-yellow-500 hover:text-yellow-400 inline-flex items-center gap-1 mt-2">
        Visit TrendFlow <ExternalLink size={10} />
      </Link>
    </div>
  );
}

function EmbedLoading() {
  return (
    <div className="h-screen flex items-center justify-center" data-testid="embed-loading">
      <Loader2 size={20} className="animate-spin text-yellow-500" />
    </div>
  );
}

export default function EmbedReport() {
  const { slug } = useParams();
  const { a, err } = useEmbedReport(slug);

  if (err) {
    return <div className="bg-[#0a0a0a] text-white"><EmbedError err={err} /></div>;
  }
  if (!a) {
    return <div className="bg-[#0a0a0a] text-white"><EmbedLoading /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" data-testid="embed-report">
      <EmbedHeader niche={a.niche} />
      <EmbedTitle analysis={a} />
      <EmbedGaugeRow analysis={a} />
      <EmbedComponentsCompact components={a.scorecard?.components} />
      {a.mode === "test" && <EmbedAlignmentRow alignment={a.alignment} />}
      <div className="flex-1" />
      <EmbedFooter slug={slug} />
    </div>
  );
}
