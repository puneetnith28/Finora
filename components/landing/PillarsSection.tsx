"use client";

import React from "react";
import { NeoBadge } from "../ui/NeoPrimitives";

export function PillarsSection() {
  const PILLARS = [
    {
      num: "01",
      title: "KEEP THE CONTEXT CONNECTED.",
      description:
        "The degree program, multi-currency study budget, co-borrower monthly income, and collateral assets all point back to the same reproducible assessment report.",
    },
    {
      num: "02",
      title: "KEEP THE ACTIONS BOUNDED.",
      description:
        "A student cannot submit unviable requests. The execution layer enforces hard lender caps and FOIR stress limits. Out-of-scope loans are flagged with remediation steps.",
    },
    {
      num: "03",
      title: "SEE WHAT ACTUALLY LANDED.",
      description:
        "Independent rule engines verify every underwriting criterion before branch application. Deterministic code, not an opaque black-box AI model, computes the final match.",
    },
  ];

  return (
    <section
      data-tour="pillars-section"
      className="w-full bg-[#FFFDF9] border-b-2 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <NeoBadge variant="pink" rotate="left">
            WHY THIS HANDOFF HELPS
          </NeoBadge>
        </div>

        <div className="border-t-2 border-black">
          {PILLARS.map((p) => (
            <div
              key={p.num}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 sm:py-10 border-b-2 border-black items-start"
            >
              <div className="md:col-span-1">
                <span className="font-mono font-black text-base sm:text-lg text-black">
                  {p.num}
                </span>
              </div>

              <div className="md:col-span-5">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-tight leading-snug">
                  {p.title}
                </h3>
              </div>

              <div className="md:col-span-6">
                <p className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
