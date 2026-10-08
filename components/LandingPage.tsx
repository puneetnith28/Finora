"use client";

import React from "react";
import { HeroSection } from "./landing/HeroSection";
import { ReceiptSection } from "./landing/ReceiptSection";
import { PillarsSection } from "./landing/PillarsSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { FaqSection } from "./landing/FaqSection";
import { CtaBanner } from "./landing/CtaBanner";

export function LandingPage() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section (Butter Yellow Canvas #FEF08A) */}
      <HeroSection />

      {/* 2. Real Recorded Case & Receipt Breakdown (Sky Cyan Canvas #BAE6FD) */}
      <ReceiptSection />

      {/* 3. Three Context Pillars Section (Linen Paper Canvas #FFFDF9) */}
      <PillarsSection />

      {/* 4. How It Works - 3 Step Flow (Mint Green Canvas #86EFAC) */}
      <HowItWorksSection />

      {/* 5. What To Know FAQ Accordions (Linen Canvas #FFFDF9) */}
      <FaqSection />

      {/* 6. Pitch Black Box Call To Action Banner (#000000) */}
      <CtaBanner />
    </div>
  );
}
