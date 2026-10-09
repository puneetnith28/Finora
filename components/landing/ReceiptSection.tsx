"use client";

import React from "react";
import { Check } from "lucide-react";
import { NeoBadge } from "../ui/NeoPrimitives";

export function ReceiptSection() {
  return (
    <section className="w-full bg-[#BAE6FD] border-b-2 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Split */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
          <div className="space-y-2">
            <NeoBadge variant="white">THE RECORDED HANDOFF</NeoBadge>
            <h2 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
              A REAL CASE. <br />
              A READABLE RECEIPT.
            </h2>
          </div>

          <p className="text-xs sm:text-sm font-bold text-neutral-800 max-w-md leading-relaxed">
            FINORA-RECORD-01 is a verified underwriting run. The deterministic engine 
            evaluated all lender rules; these records were independently computed and verified.
          </p>
        </div>

        {/* Large White Receipt Box */}
        <div className="neo-box-lg bg-white p-6 sm:p-10 space-y-8">
          {/* Top Status Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
            <div className="flex items-center gap-3">
              <NeoBadge variant="mint">RECORDED STATUS: COMPLETE</NeoBadge>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-black text-black block">OCTOBER 8, 2026</span>
              <span className="text-[11px] font-bold text-neutral-600">
                Deterministic Engine • 4 Verified Underwriting Records
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">
              STUDY BUDGET GAP → TIER-1 LENDER AUDIT #1
            </h3>
          </div>

          {/* Audit Rows */}
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 border-b-2 border-black items-start">
              <div className="md:col-span-4 space-y-1">
                <NeoBadge variant="pink">01 / STUDY PLAN</NeoBadge>
                <div className="text-xs font-black text-black">MS in Computer Science • USA</div>
                <div className="text-[11px] font-bold text-neutral-600">Columbia University</div>
              </div>
              <div className="md:col-span-8 text-xs font-bold space-y-1">
                <div className="flex items-center gap-1.5 text-black">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="font-black">Independently verified FX rates</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-700">
                  Tuition: $60,000 • Living: $22,000 • Total Normalized INR: ₹69,70,000
                </div>
                <div className="text-[11px] text-neutral-600">
                  Target degree matches Tier-1 approved STEM registry.
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 border-b-2 border-black items-start">
              <div className="md:col-span-4 space-y-1">
                <NeoBadge variant="cyan">02 / FOIR RATIO</NeoBadge>
                <div className="text-xs font-black text-black">Co-Borrower Income & Debt</div>
                <div className="text-[11px] font-bold text-neutral-600">Fixed Obligation Analysis</div>
              </div>
              <div className="md:col-span-8 text-xs font-bold space-y-1">
                <div className="flex items-center gap-1.5 text-black">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="font-black">Independently calculated FOIR</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-700">
                  Income: ₹1,50,000/mo • Existing EMIs: ₹10,000 • Proposed EMI: ₹54,057 • FOIR: 42.7%
                </div>
                <div className="text-[11px] text-neutral-600">
                  FOIR is within safe 50% ceiling for Prime Public Banks and NBFCs.
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 border-b-2 border-black items-start">
              <div className="md:col-span-4 space-y-1">
                <NeoBadge variant="mint">03 / COLLATERAL PLEDGE</NeoBadge>
                <div className="text-xs font-black text-black">Immovable Property Asset</div>
                <div className="text-[11px] font-bold text-neutral-600">80% LTV Haircut Applied</div>
              </div>
              <div className="md:col-span-8 text-xs font-bold space-y-1">
                <div className="flex items-center gap-1.5 text-black">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="font-black">Independently verified security</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-700">
                  Market Value: ₹90,00,000 • Haircut: 20% • Eligible Lending Value: ₹72,00,000
                </div>
                <div className="text-[11px] text-neutral-600">
                  Pledge satisfies 100% tangible security requirement for Secured Global Bank.
                </div>
              </div>
            </div>
          </div>

          {/* Yellow Replay Block */}
          <div className="neo-box-yellow p-4 space-y-1.5">
            <div className="text-xs font-black uppercase text-black tracking-tight">
              SAME REPORT ID. SAME RECORDED IDS.
            </div>
            <p className="text-xs font-bold text-neutral-900 leading-snug">
              The same assessment was re-evaluated against the 4 lender criteria sets. 
              The rerun produced zero drift — exactly matching all threshold rules and scores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
