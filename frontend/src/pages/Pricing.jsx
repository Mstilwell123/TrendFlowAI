import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../lib/auth";
import BillingToggle from "../components/pricing/BillingToggle";
import PricingTierGrid from "../components/pricing/PricingTierGrid";
import TopupPacks from "../components/pricing/TopupPacks";
import PricingFAQ from "../components/pricing/PricingFAQ";

function PricingHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-black/70 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-neutral-400">
          <Link to="/" className="hover:text-white" data-testid="pricing-nav-home">Home</Link>
          <Link to="/pricing" className="text-white" data-testid="pricing-nav-pricing">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-neutral-300 hover:text-white px-3 py-2" data-testid="pricing-header-login">
            Sign in
          </Link>
          <Link
            to="/signup"
            data-testid="pricing-header-signup"
            className="text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-sm"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

function PricingHero({ interval, setInterval_ }) {
  return (
    <section className="relative">
      <div className="absolute inset-0 vt-grid-bg opacity-40 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-5 lg:px-8 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-yellow-500/30 bg-yellow-500/5 rounded-sm text-xs text-yellow-500 uppercase tracking-widest mb-6">
          <Sparkles size={12} /> Built for short-form creators
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
          Stop guessing. <span className="text-yellow-500">Engineer virality.</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
          One credit = one video analysis. Study any viral video or test your own draft.
          Cancel anytime, top-up credits never expire.
        </p>
        <BillingToggle value={interval} onChange={setInterval_} />
      </div>
    </section>
  );
}

function PricingTopupsSection({ onBuy }) {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-20 border-t border-neutral-900">
      <div className="max-w-2xl mb-10">
        <div className="text-xs uppercase tracking-widest text-yellow-500 mb-3">Top-up packs</div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Need more credits this month?
        </h2>
        <p className="text-neutral-400">
          One-time packs that stack on top of your monthly allowance. Top-up credits never expire.
        </p>
      </div>
      <TopupPacks onBuy={onBuy} />
    </section>
  );
}

function PricingFinalCTA() {
  return (
    <section className="border-t border-neutral-900">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">
          Start free. <span className="text-yellow-500">Pay when you ship.</span>
        </h2>
        <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
          Three free video analyses — the full 10-component teardown. No credit card.
        </p>
        <Link
          to="/signup"
          data-testid="pricing-final-cta"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-6 py-3.5 rounded-sm"
        >
          Try TrendFlow free <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function PricingFooter() {
  return (
    <footer className="border-t border-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <Logo />
        <div>© 2026 The TrendFlow App · Crafted for creators who ship.</div>
      </div>
    </footer>
  );
}

export default function Pricing() {
  const [interval_, setInterval_] = useState("monthly");
  const { user } = useAuth();
  const nav = useNavigate();

  const onSelectPlan = (tier, billingInterval) => {
    if (tier.id === "free") {
      if (user) nav("/app");
      else nav("/signup");
      return;
    }
    toast.info("Stripe checkout coming soon", {
      description: `${tier.name} · ${billingInterval} (${billingInterval === "annual" ? "$" + tier.annual + "/mo" : "$" + tier.monthly + "/mo"}) — wiring up Stripe is the next iteration.`,
      duration: 5000,
    });
  };

  const onBuyTopup = (pack) => {
    toast.info("Stripe checkout coming soon", {
      description: `${pack.label} · $${pack.price} — wiring up Stripe is the next iteration.`,
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" data-testid="pricing-page">
      <PricingHeader />
      <PricingHero interval={interval_} setInterval_={setInterval_} />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-20">
        <PricingTierGrid interval={interval_} onSelect={onSelectPlan} />
      </section>
      <PricingTopupsSection onBuy={onBuyTopup} />
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-20 border-t border-neutral-900">
        <PricingFAQ />
      </section>
      <PricingFinalCTA />
      <PricingFooter />
    </div>
  );
}
