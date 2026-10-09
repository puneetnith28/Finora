"use client";

import React from "react";
import { Check } from "lucide-react";
import { NeoBadge } from "../ui/NeoPrimitives";

function useFormattedDate() {
  return React.useSyncExternalStore(
    () => () => {},
    () =>
      new Date()
        .toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase(),
    () => "OCTOBER 8, 2026"
  );
}

export function ReceiptSection() {
  const currentDate = useFormattedDate();

  return (
    <section
      id="receipt-section"
      className="w-full bg-[#BAE6FD] border-b-2 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header Split */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b-2 border-black/30">
          <div className="space-y-3">
            <NeoBadge
              variant="white"
              className="text-xs sm:text-sm font-black px-3 py-1 shadow-[2px_2px_0px_0px_#000000]"
            >
              THE RECORDED HANDOFF
            </NeoBadge>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight leading-[0.95]">
              A REAL CASE. <br />A READABLE RECEIPT.
            </h2>
          </div>

          <p className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900 max-w-lg leading-relaxed">
            FINORA-RECORD-01 is a verified underwriting run. The deterministic engine evaluated all
            lender rules; these records were independently computed and verified.
          </p>
        </div>

        {/* Large White Receipt Box */}
        <div
          data-tour="receipt-box"
          className="neo-box-lg bg-white p-6 sm:p-10 lg:p-12 space-y-8 shadow-[8px_8px_0px_0px_#000000] border-3 border-black"
        >
          {/* Top Status Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-3 border-black">
            <div className="flex items-center gap-3">
              <NeoBadge
                variant="mint"
                className="text-xs sm:text-sm font-black px-3 py-1.5 shadow-[3px_3px_0px_0px_#000000]"
              >
                RECORDED STATUS: COMPLETE
              </NeoBadge>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-sm sm:text-base font-black text-black block">
                {currentDate}
              </span>
              <span className="text-xs sm:text-sm font-bold text-neutral-700">
                Deterministic Engine • 5 Verified Underwriting Records
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-tight">
              STUDY BUDGET GAP → TIER-1 LENDER AUDIT #1
            </h3>
          </div>

          {/* Audit Rows */}
          <div className="space-y-8">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b-2 border-black items-start">
              <div className="md:col-span-4 space-y-2">
                <NeoBadge variant="pink" className="text-xs sm:text-sm font-black px-3 py-1">
                  01 / STUDY PLAN
                </NeoBadge>
                <div className="text-base sm:text-lg font-black text-black">
                  MS in Computer Science • USA
                </div>
                <div className="text-xs sm:text-sm font-bold text-neutral-700">
                  Columbia University
                </div>
              </div>
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center gap-2 text-black">
                  <Check className="h-5 w-5 stroke-[3] text-black shrink-0" />
                  <span className="text-base sm:text-lg font-black">
                    Independently verified FX rates
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-neutral-900 bg-[#FFFDF9] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  Tuition: $60,000 • Living: $22,000 • Total Normalized INR: ₹69,70,000
                </div>
                <div className="text-xs sm:text-sm font-bold text-neutral-700">
                  Target degree matches Tier-1 approved STEM registry.
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b-2 border-black items-start">
              <div className="md:col-span-4 space-y-2">
                <NeoBadge variant="cyan" className="text-xs sm:text-sm font-black px-3 py-1">
                  02 / FOIR RATIO
                </NeoBadge>
                <div className="text-base sm:text-lg font-black text-black">
                  Co-Borrower Income & Debt
                </div>
                <div className="text-xs sm:text-sm font-bold text-neutral-700">
                  Fixed Obligation Analysis
                </div>
              </div>
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center gap-2 text-black">
                  <Check className="h-5 w-5 stroke-[3] text-black shrink-0" />
                  <span className="text-base sm:text-lg font-black">
                    Independently calculated FOIR
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-neutral-900 bg-[#FFFDF9] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  Income: ₹1,50,000/mo • Existing EMIs: ₹10,000 • Proposed EMI: ₹54,057 • FOIR:
                  42.7%
                </div>
                <div className="text-xs sm:text-sm font-bold text-neutral-700">
                  FOIR is within safe 50% ceiling for Prime Public Banks and NBFCs.
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b-2 border-black items-start">
              <div className="md:col-span-4 space-y-2">
                <NeoBadge variant="mint" className="text-xs sm:text-sm font-black px-3 py-1">
                  03 / COLLATERAL PLEDGE
                </NeoBadge>
                <div className="text-base sm:text-lg font-black text-black">
                  Immovable Property Asset
                </div>
                <div className="text-xs sm:text-sm font-bold text-neutral-700">
                  80% LTV Haircut Applied
                </div>
              </div>
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center gap-2 text-black">
                  <Check className="h-5 w-5 stroke-[3] text-black shrink-0" />
                  <span className="text-base sm:text-lg font-black">
                    Independently verified security
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-neutral-900 bg-[#FFFDF9] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                  Market Value: ₹90,00,000 • Haircut: 20% • Eligible Lending Value: ₹72,00,000
                </div>
                <div className="text-xs sm:text-sm font-bold text-neutral-700">
                  Pledge satisfies 100% tangible security requirement for Public Sector Lenders (e.g. SBI / BOB).
                </div>
              </div>
            </div>
          </div>

          {/* Yellow Replay Block */}
          <div className="neo-box-yellow p-5 sm:p-6 space-y-2 border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
            <div className="text-sm sm:text-base font-black uppercase text-black tracking-tight">
              SAME REPORT ID. SAME RECORDED IDS.
            </div>
            <p className="text-xs sm:text-sm font-bold text-neutral-950 leading-relaxed">
              The same assessment was re-evaluated against the 5 benchmark lender criteria sets. The rerun
              produced zero drift — exactly matching all threshold rules and scores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
