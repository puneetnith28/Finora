"use client";

import React from "react";
import { HeroSection } from "./landing/HeroSection";
import { DemoScenarioSelector } from "./demo/DemoScenarioSelector";
import { ReceiptSection } from "./landing/ReceiptSection";
import { PillarsSection } from "./landing/PillarsSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { InspectTrailSection } from "./landing/InspectTrailSection";
import { FaqSection } from "./landing/FaqSection";
import { CtaBanner } from "./landing/CtaBanner";

export function LandingPage() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section (Butter Yellow Canvas #FEF08A) */}
      <HeroSection />

      {/* 2. Reviewer Fast-Track Demo Personas */}
      <section className="w-full bg-[#FEF3C7] border-b-3 border-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <DemoScenarioSelector />
        </div>
      </section>

      {/* 3. Real Recorded Case & Receipt Breakdown (Sky Cyan Canvas #BAE6FD) */}
      <ReceiptSection />

      {/* 4. Three Context Pillars Section (Linen Paper Canvas #FFFDF9) */}
      <PillarsSection />

      {/* 5. How It Works - 3 Step Flow (Mint Green Canvas #86EFAC) */}
      <HowItWorksSection />

      {/* 6. A Trail You Can Inspect - Live Dossier (Soft Pink Canvas #FECDD3) */}
      <InspectTrailSection />

      {/* 7. What To Know FAQ Accordions (Linen Canvas #FFFDF9) */}
      <FaqSection />

      {/* 8. Pitch Black Box Call To Action Banner (#000000) */}
      <CtaBanner />
    </div>
  );
}
