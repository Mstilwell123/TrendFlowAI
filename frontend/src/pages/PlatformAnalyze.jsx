import React from "react";
import { useParams } from "react-router-dom";
import PlatformMenuBar from "@/components/analyze/PlatformMenuBar";
import ModeTabs from "@/components/analyze/ModeTabs";
import PlatformComing from "@/components/analyze/PlatformComing";
import TrendsPanel from "@/components/trends/TrendsPanel";
import StudyMode from "@/pages/StudyMode";
import TestMode from "@/pages/TestMode";
import { getPlatform } from "@/lib/platforms";
import { isShortsPlatform } from "@/lib/shortsRubric";

/**
 * Desktop Analyze surface: platform menu (TikTok|YouTube|Instagram|Facebook)
 * then Study | Test | Trends scoped to that platform.
 * v1 product lock: YouTube Shorts deep pre-flight; TikTok remains in-tree; IG/FB stubs.
 */
export default function PlatformAnalyze() {
  const { platform = "youtube", mode = "test" } = useParams();
  const p = getPlatform(platform);
  const ready = p.status === "ready";
  const shorts = isShortsPlatform(platform);

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-7xl mx-auto" data-testid="platform-analyze">
      <div className="mb-2">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">
          {shorts ? "YouTube Shorts · Pre-flight" : "Analyze · Pre-flight"}
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          {shorts ? "Score your Short before you upload" : "Draft check before you publish"}
        </h1>
        <p className="text-neutral-400 mt-3 max-w-3xl text-sm lg:text-base leading-relaxed">
          {shorts ? (
            <>
              TrendFlow Desktop v1 is a <span className="text-neutral-200">YouTube Shorts pre-flight scorecard</span>{" "}
              — Test is the hero (your draft), Study is support, Trends is a thin helper. Stop posting blind.
            </>
          ) : (
            <>
              Most tools sell post-mortem analysis. TrendFlow sells the pre-flight check —
              compare your draft against <span className="text-neutral-200">currently viral / high-performing</span>{" "}
              videos on this platform, not flop-only.
            </>
          )}
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
  if (mode === "test") {
    return <TestMode embedded platform={platform} />;
  }
  return <StudyMode embedded platform={platform} />;
}
