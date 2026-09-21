import React from "react";
import LandingHeader from "../components/landing/LandingHeader";
import LandingHero from "../components/landing/LandingHero";
import LandingHowItWorks from "../components/landing/LandingHowItWorks";
import LandingComponentsGrid from "../components/landing/LandingComponentsGrid";
import { LandingPricing, LandingFinalCTA, LandingFooter } from "../components/landing/LandingPricing";
import LandingFAQ from "../components/seo/LandingFAQ";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <LandingHeader />
      <LandingHero />
      <LandingHowItWorks />
      <LandingComponentsGrid />
      <LandingFAQ />
      <LandingPricing />
      <LandingFinalCTA />
      <LandingFooter />
    </div>
  );
}
