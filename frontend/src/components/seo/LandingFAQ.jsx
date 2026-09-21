import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const SEO_FAQ = [
  {
    q: "What is a YouTube Shorts pre-flight check?",
    a: "A pre-flight check scores your draft Short before you upload — hooks, retention risk, title/cover fit, and payoff — so you fix weak spots before the feed sees them.",
  },
  {
    q: "How is TrendFlow different from YouTube Studio analytics?",
    a: "Studio shows what already happened after publish. TrendFlow is the pre-flight check: analyze the draft against Shorts-native signals before you post.",
  },
  {
    q: "Can I analyze a draft Short before uploading?",
    a: "Yes. Upload or describe your draft, run Test mode, get a scorecard with the weakest levers to fix first, then rewrite and publish.",
  },
  {
    q: "Is TrendFlow only for YouTube Shorts?",
    a: "v1 is locked to YouTube Shorts only. Other platforms may show as coming stubs until Mark unlocks expansion.",
  },
  {
    q: "Who is TrendFlow for?",
    a: "Creators and Agent Swarm members who want a desktop-first Shorts pre-flight scorecard — taught and sold via Agent Swarm by Pragvance first.",
  },
];

export default function LandingFAQ() {
  return (
    <section className="max-w-3xl mx-auto px-5 lg:px-8 py-16" data-testid="seo-faq" id="faq">
      <div className="text-xs uppercase tracking-widest text-yellow-500 mb-3 text-center">FAQ</div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-10">
        YouTube Shorts pre-flight — common questions
      </h2>
      <div className="space-y-2">
        {SEO_FAQ.map((item, i) => (
          <FAQItem key={item.q} item={item} idx={i} />
        ))}
      </div>
    </section>
  );
}

function FAQItem({ item, idx }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="border border-neutral-900 rounded-sm bg-[#0f0f0f]" data-testid={`seo-faq-item-${idx}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-900/50 transition-colors"
        type="button"
      >
        <span className="text-sm font-medium pr-4">{item.q}</span>
        {open ? <ChevronUp size={16} className="text-neutral-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-neutral-500 flex-shrink-0" />}
      </button>
      {open && <div className="px-5 pb-4 text-sm text-neutral-400 leading-relaxed">{item.a}</div>}
    </div>
  );
}
