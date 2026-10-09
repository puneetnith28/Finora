"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { NeoBadge, NeoButton } from "../ui/NeoPrimitives";
import { useTour } from "@/lib/context/TourContext";

export function HeroSection() {
  const { startTour } = useTour();

  return (
    <section className="w-full bg-[#FEF08A] border-b-2 border-black py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Editorial Headline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center">
            <NeoBadge variant="pink" rotate="left" className="shadow-[2px_2px_0px_0px_#000000]">
              ONE REPORT. CONNECTED CONTEXT.
            </NeoBadge>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black uppercase leading-[0.95]">
            ONE REPORT. <br />
            ONE VERIFIED <br />
            <span className="inline-block bg-[#FEF08A] border-2 border-black px-3 py-0.5 shadow-[4px_4px_0px_0px_#000000] mt-1">
              HANDOFF.
            </span>
          </h1>

          <p className="text-base sm:text-lg font-bold text-black max-w-xl leading-snug">
            A student plans study-abroad funding. Finora&apos;s deterministic engine verifies 
            multi-currency budgets, FOIR debt ratios, collateral haircuts, and lender criteria, 
            then generates an explainable receipt.
          </p>

          <div data-tour="hero-cta" className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/assessment">
              <NeoButton variant="primary" size="lg">
                <span>EXPLORE THE RECORDED HANDOFF</span>
                <ArrowUpRight className="h-4 w-4" />
              </NeoButton>
            </Link>

            <button
              type="button"
              onClick={() => startTour(0)}
              className="neo-btn bg-[#FFFDF9] hover:bg-[#86EFAC] text-black px-5 py-3.5 text-sm font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000]"
            >
              <Compass className="h-4 w-4 stroke-[2.5]" />
              <span>TAKE PRODUCT TOUR (2 MIN)</span>
            </button>
          </div>

          <p className="text-xs font-bold text-neutral-800 pt-2">
            Real loan readiness records, read back on October 2026.
          </p>
        </div>

        {/* Right Sticky Note Cards Showcase */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Sky Cyan Customer Note */}
          <div className="neo-box-cyan p-5 -rotate-1 shadow-[5px_5px_0px_0px_#000000]">
            <div className="flex items-center justify-between mb-3">
              <NeoBadge variant="white" className="border-2 border-black">
                THE CANDIDATE REPORT
              </NeoBadge>
            </div>
            <p className="text-xs sm:text-sm font-black text-black leading-snug">
              Large study deficits fail outright without collateral. Hand this to the lender 
              matrix and verify the exact underwriting verdict.
            </p>
            <span className="text-[10px] font-bold text-neutral-700 block mt-3">
              Report summary, synthesized for lender review
            </span>
          </div>

          {/* Card 2: White Receipt Box */}
          <div className="neo-box-lg p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <NeoBadge variant="mint">RECORDED RESULT</NeoBadge>
              <NeoBadge variant="yellow" rotate="right">
                READ BACK ✓
              </NeoBadge>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                THE HANDOFF HAS A TRAIL.
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex items-center justify-between pb-2 border-b border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black">Global Ed Bank</span>
                </div>
                <span className="text-neutral-700 font-medium">Eligible • Up to ₹75L</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black">STEM NBFC</span>
                </div>
                <span className="text-neutral-700 font-medium">Approved • 60% FOIR ceiling</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black">Secured Bank</span>
                </div>
                <span className="text-neutral-700 font-medium">Collateral Title Deed required</span>
              </div>
            </div>

            <div className="p-3 bg-[#F472B6] border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000000]">
              Out of scope? Unverifiable income rejected by OCR discrepancy check.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
