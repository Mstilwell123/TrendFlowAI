import React from "react";
import { Link } from "react-router-dom";
import { Search, Target, Flame, ArrowRight } from "lucide-react";

const ACTIONS = [
  {
    to: "/app/youtube/test",
    icon: Target,
    testid: "quick-test-card",
    title: "Test a Short",
    body: "Hero mode — upload your draft Short, get the 10-field pre-flight + fix-these-first.",
    cta: "Open Test",
  },
  {
    to: "/app/youtube/study",
    icon: Search,
    testid: "quick-study-card",
    title: "Study a Short",
    body: "Support mode — paste a reference Short URL to learn the Shorts rubric.",
    cta: "Open Study",
  },
  {
    to: "/app/youtube/trends",
    icon: Flame,
    testid: "quick-trends-card",
    title: "Shorts Trends",
    body: "Thin helper — optional format/topic context. Test stays the hero.",
    cta: "Open Trends",
  },
];

export default function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.to}
            to={a.to}
            data-testid={a.testid}
            className="group p-7 border border-neutral-900 hover:border-yellow-500/50 bg-[#101010] rounded-sm transition-colors"
          >
            <Icon size={24} className="text-yellow-500 mb-4" strokeWidth={1.5} />
            <div className="text-lg font-semibold mb-2">{a.title}</div>
            <p className="text-sm text-neutral-400 mb-4">{a.body}</p>
            <span className="inline-flex items-center gap-1 text-sm text-yellow-500 group-hover:gap-2 transition-all">
              {a.cta} <ArrowRight size={14} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
