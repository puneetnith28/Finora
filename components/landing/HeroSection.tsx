"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NeoBadge, NeoButton } from "../ui/NeoPrimitives";

export function HeroSection() {
  const scrollToReceipt = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("receipt-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-[#FEF08A] border-b-2 border-black min-h-[calc(100vh-64px)] min-h-[calc(100dvh-64px)] flex flex-col justify-between py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* Main Content Grid (Vertically Centered in Available Space) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto">
        {/* Left Editorial Headline */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-2">
            <NeoBadge
              variant="pink"
              rotate="left"
              className="shadow-[3px_3px_0px_0px_#000000] text-xs sm:text-sm font-black px-3 py-1"
            >
              ONE REPORT. CONNECTED CONTEXT.
            </NeoBadge>
            <span className="hidden sm:inline-block text-xs font-black bg-black text-[#FEF08A] px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#000000]">
              OCTOBER 2026 EDITION
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-black tracking-tight text-black uppercase leading-[0.92]">
            ONE REPORT. <br />
            ONE VERIFIED <br />
            <span className="inline-block bg-[#FEF08A] border-3 border-black px-3 sm:px-4 py-1 shadow-[5px_5px_0px_0px_#000000] mt-1.5">
              HANDOFF.
            </span>
          </h1>

          <p className="text-base sm:text-xl font-bold text-black max-w-xl leading-snug">
            A student plans study-abroad funding. Finora&apos;s deterministic engine verifies
            multi-currency budgets, FOIR debt ratios, collateral haircuts, and lender criteria, then
            generates an explainable receipt.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <div data-tour="hero-cta">
              <Link href="/assessment">
                <NeoButton
                  variant="primary"
                  size="lg"
                  className="text-sm sm:text-base font-black px-6 py-3.5 shadow-[4px_4px_0px_0px_#000000]"
                >
                  <span>EXPLORE THE RECORDED HANDOFF</span>
                  <ArrowUpRight className="h-5 w-5" />
                </NeoButton>
              </Link>
            </div>

            <button
              onClick={scrollToReceipt}
              className="text-xs sm:text-sm font-black uppercase underline underline-offset-4 hover:bg-black hover:text-[#FEF08A] px-3 py-2 transition-colors border border-transparent hover:border-black cursor-pointer"
            >
              See Live Audit Breakdown ↓
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-neutral-800 pt-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Deterministic pre-underwriting audit trail • 100% Explainable & verifiable</span>
          </div>
        </div>

        {/* Right Sticky Note Cards Showcase */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Sky Cyan Customer Note */}
          <div className="neo-box-cyan p-5 sm:p-6 -rotate-1 shadow-[5px_5px_0px_0px_#000000] border-3 border-black">
            <div className="flex items-center justify-between mb-3">
              <NeoBadge variant="white" className="border-2 border-black font-black text-xs">
                THE CANDIDATE REPORT
              </NeoBadge>
              <span className="text-[10px] font-black bg-black text-white px-2 py-0.5">
                VERIFIED
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black text-black leading-snug">
              Large study deficits fail outright without collateral. Hand this to the lender matrix
              and verify the exact underwriting verdict.
            </p>
            <span className="text-[10px] font-bold text-neutral-700 block mt-3 uppercase tracking-wide">
              Report summary, synthesized for lender review
            </span>
          </div>

          {/* Card 2: White Receipt Box */}
          <div className="neo-box-lg p-5 sm:p-6 bg-white space-y-4 shadow-[6px_6px_0px_0px_#000000] border-3 border-black">
            <div className="flex items-center justify-between">
              <NeoBadge variant="mint" className="font-black text-xs">
                RECORDED RESULT
              </NeoBadge>
              <NeoBadge variant="yellow" rotate="right" className="font-black text-xs">
                READ BACK ✓
              </NeoBadge>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                THE HANDOFF HAS A TRAIL.
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black">Global Ed Bank</span>
                </div>
                <span className="text-neutral-800 font-bold">Eligible • Up to ₹75L</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black">STEM NBFC</span>
                </div>
                <span className="text-neutral-800 font-bold">Approved • 60% FOIR ceiling</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black">Secured Bank</span>
                </div>
                <span className="text-neutral-800 font-bold">Collateral Title Deed required</span>
              </div>
            </div>

            <div className="p-3 bg-[#F472B6] border-2 border-black text-black text-xs font-black shadow-[3px_3px_0px_0px_#000000]">
              Out of scope? Unverifiable income rejected by OCR discrepancy check.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Feature Strip (Fills the Hero base cleanly) */}
      <div className="max-w-7xl mx-auto w-full pt-8 sm:pt-10 border-t-2 border-black/30 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/80 border-2 border-black p-2.5 sm:p-3 shadow-[2px_2px_0px_0px_#000000]">
            <span className="text-[10px] font-bold text-neutral-600 block uppercase">
              01 / CALCULATION
            </span>
            <span className="text-xs sm:text-sm font-black text-black block">
              Deterministic Engine
            </span>
          </div>
          <div className="bg-white/80 border-2 border-black p-2.5 sm:p-3 shadow-[2px_2px_0px_0px_#000000]">
            <span className="text-[10px] font-bold text-neutral-600 block uppercase">
              02 / CURRENCIES
            </span>
            <span className="text-xs sm:text-sm font-black text-black block">
              Live FX Normalization
            </span>
          </div>
          <div className="bg-white/80 border-2 border-black p-2.5 sm:p-3 shadow-[2px_2px_0px_0px_#000000]">
            <span className="text-[10px] font-bold text-neutral-600 block uppercase">
              03 / POLICY RULES
            </span>
            <span className="text-xs sm:text-sm font-black text-black block">
              4 Benchmark Lenders
            </span>
          </div>
          <div className="bg-white/80 border-2 border-black p-2.5 sm:p-3 shadow-[2px_2px_0px_0px_#000000]">
            <span className="text-[10px] font-bold text-neutral-600 block uppercase">
              04 / AUDIT TRAIL
            </span>
            <span className="text-xs sm:text-sm font-black text-black block">
              Tamper-Proof Receipt
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
