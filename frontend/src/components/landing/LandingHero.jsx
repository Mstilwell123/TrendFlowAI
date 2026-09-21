import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const CHECKLIST = ["YouTube Shorts v1", "Pre-flight before upload", "Agent Swarm channel"];

export default function LandingHero() {
  const nav = useNavigate();
  return (
    <section className="relative">
      <div className="absolute inset-0 vt-grid-bg opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url(https://images.pexels.com/photos/7505924/pexels-photo-7505924.jpeg)",
          backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "luminosity",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-28 md:pt-32 md:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-yellow-500/30 bg-yellow-500/5 rounded-sm text-xs text-yellow-500 uppercase tracking-widest mb-6" data-testid="hero-badge">
            <Sparkles size={12} /> YouTube Shorts pre-flight analyzer
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-6">
            YouTube Shorts<br />
            <span className="text-neutral-500">pre-flight analyzer.</span><br />
            Most tools sell<br />
            <span className="text-neutral-500">post-mortem.</span><br />
            TrendFlow sells the<br />
            <span style={{ color: "#EAB308" }}>pre-flight check.</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mb-10 leading-relaxed">
            Analyze your draft Short <em>before</em> you post — score hooks, retention, title/cover fit,
            and payoff against Shorts-native signals. Desktop-first scorecard. Study · Test · Trends.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => nav("/signup")}
              data-testid="hero-cta-primary"
              className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-6 py-3.5 rounded-sm transition-colors"
            >
              Try it free <ArrowRight size={16} />
            </button>
            <a
              href="#how"
              data-testid="hero-cta-secondary"
              className="inline-flex items-center justify-center gap-2 border border-neutral-800 hover:border-neutral-600 text-white px-6 py-3.5 rounded-sm transition-colors"
            >
              See how it works
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-neutral-500 flex-wrap">
            {CHECKLIST.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-yellow-500" /> {c}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
