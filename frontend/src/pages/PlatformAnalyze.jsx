import React from "react";
import { useParams } from "react-router-dom";
import PlatformMenuBar from "@/components/analyze/PlatformMenuBar";
import ModeTabs from "@/components/analyze/ModeTabs";
import PlatformComing from "@/components/analyze/PlatformComing";
import TrendsPanel from "@/components/trends/TrendsPanel";
import StudyMode from "@/pages/StudyMode";
import TestMode from "@/pages/TestMode";
import { getPlatform } from "@/lib/platforms";

/**
 * Desktop Analyze surface: platform menu (TikTok|YouTube|Instagram|Facebook)
 * then Study | Test | Trends scoped to that platform.
 * Phase 1: TikTok deep; other platforms = native stubs (not TikTok reused).
 */
export default function PlatformAnalyze() {
  const { platform = "tiktok", mode = "study" } = useParams();
  const p = getPlatform(platform);
  const ready = p.status === "ready";

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-7xl mx-auto" data-testid="platform-analyze">
      <div className="mb-2">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Analyze · Pre-flight</div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Draft check before you publish
        </h1>
        <p className="text-neutral-400 mt-3 max-w-3xl text-sm lg:text-base leading-relaxed">
          Most tools sell post-mortem analysis. TrendFlow sells the pre-flight check —
          compare your draft against <span className="text-neutral-200">currently viral / high-performing</span>{" "}
          videos on this platform, not flop-only.
        </p>
      </div>

      <PlatformMenuBar mode={mode} />
      <ModeTabs />

      {!ready ? (
        <PlatformComing platformId={platform} mode={mode} />
      ) : mode === "trends" ? (
        <TrendsPanel platform={platform} />
      ) : mode === "test" ? (
        <StudyOrTestEmbedded mode="test" platform={platform} />
      ) : (
        <StudyOrTestEmbedded mode="study" platform={platform} />
      )}
    </div>
  );
}

function StudyOrTestEmbedded({ mode, platform }) {
  // Reuse existing Study/Test forms without their outer page chrome
  if (mode === "test") {
    return <TestMode embedded platform={platform} />;
  }
  return <StudyMode embedded platform={platform} />;
}
