"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { CANONICAL_DEMO_PERSONAS } from "@/lib/constants/demo";

export function InspectTrailSection() {
  const [selectedCase, setSelectedCase] = useState<number>(0);

  const CASES = CANONICAL_DEMO_PERSONAS.slice(0, 3).map((p) => ({
    id: `FIN-DEMO-${p.num}`,
    title: `${p.name} • ${p.course} (${p.country})`,
    country: p.country,
    currency: p.currency,
    loanNeeded: p.loanNeeded,
    foir: p.foir,
    score: p.score,
    status: p.status,
    trail: p.trail,
  }));

  const activeCase = CASES[selectedCase];

  return (
    <section className="w-full bg-[#FECDD3] border-b-3 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Sticker Badge */}
        <div>
          <span className="inline-block bg-white text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
            A TRAIL YOU CAN INSPECT
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
              VERIFIED AUDIT TRAILS.
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/80 mt-2 max-w-xl">
              Inspect live recorded test cases. Review exact intermediate evaluations, multi-currency conversions, and underwriting verdicts.
            </p>
          </div>

          {/* Case Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {CASES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(i)}
                className={`px-3 py-2 text-xs font-black uppercase border-2 border-black transition-all ${
                  selectedCase === i
                    ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
                    : "bg-white text-black hover:bg-[#F3F4F6]"
                }`}
              >
                Case #{i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Inspection Dossier Card */}
        <div className="neo-box p-6 sm:p-8 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
            <div>
              <span className="text-[10px] font-mono font-bold bg-[#FEF08A] px-2 py-0.5 border border-black uppercase">
                {activeCase.id} • {activeCase.country}
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mt-1">
                {activeCase.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-block bg-[#86EFAC] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
                {activeCase.status}
              </span>
            </div>
          </div>

          {/* 3 Trail Steps */}
          <div className="space-y-3">
            {activeCase.trail.map((t, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#FFFDF9] border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000000]"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-black text-white font-mono font-black text-xs px-2 py-0.5 border border-black">
                    {t.app}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-black">
                    {t.result}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#16A34A] flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-4 w-4 stroke-[3]" /> Independently Verified
                </span>
              </div>
            ))}
          </div>

          {/* Quick Metrics Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-2 border-black text-xs font-mono">
            <div>
              <span className="text-black/60 block text-[9px] font-black uppercase">Loan Requirement</span>
              <span className="font-black text-black text-sm">{activeCase.loanNeeded}</span>
            </div>
            <div>
              <span className="text-black/60 block text-[9px] font-black uppercase">Co-Borrower FOIR</span>
              <span className="font-black text-black text-sm">{activeCase.foir}</span>
            </div>
            <div>
              <span className="text-black/60 block text-[9px] font-black uppercase">Readiness Score</span>
              <span className="font-black text-black text-sm">{activeCase.score}</span>
            </div>
            <div>
              <span className="text-black/60 block text-[9px] font-black uppercase">Underwriting Sync</span>
              <span className="font-black text-black text-sm text-[#16A34A]">✓ Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
