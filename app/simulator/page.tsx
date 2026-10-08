import React from "react";
import { FoirSimulator } from "@/components/simulator/FoirSimulator";
import { Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";
import { NeoBadge, NeoButton } from "@/components/ui/NeoPrimitives";
import Link from "next/link";

export const metadata = {
  title: "FOIR & Education Loan EMI Simulator | Finora",
  description:
    "Simulate education loan terms, analyze Fixed Obligation to Income Ratio (FOIR), and evaluate borrowing capacity.",
};

export default function SimulatorPage() {
  return (
    <div className="w-full bg-[#FEF3C7] min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto w-full space-y-8">
        <div className="space-y-3">
          <NeoBadge variant="pink" rotate="left">
            <Sparkles className="h-3.5 w-3.5" />
            <span>REAL-TIME DEBT AFFORDABILITY ENGINE</span>
          </NeoBadge>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
            LOAN EMI & FOIR SIMULATOR
          </h1>
          <p className="text-xs sm:text-sm font-bold text-neutral-800 max-w-2xl leading-relaxed">
            Adjust loan amounts, interest slabs, and household income to see instant debt burden
            metrics, maximum sanction headroom, and lender threshold compliance.
          </p>
        </div>

        <FoirSimulator />

        {/* Informational Callout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="neo-box p-5 bg-white space-y-2">
            <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>WHAT IS FOIR?</span>
            </h3>
            <p className="text-xs font-bold text-neutral-700 leading-relaxed">
              Fixed Obligation to Income Ratio (FOIR) measures what percentage of the co-borrower’s monthly
              income goes toward all debt obligations including the new education loan EMI.
            </p>
          </div>

          <div className="neo-box p-5 bg-white space-y-2">
            <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>LENDER BENCHMARKS</span>
            </h3>
            <p className="text-xs font-bold text-neutral-700 leading-relaxed">
              Leading PSU lenders and private banks cap FOIR between <strong>40% to 50%</strong>.
              Higher FOIR (&gt; 50%) requires additional collateral, longer tenure, or co-borrower additions.
            </p>
          </div>

          <div className="neo-box-yellow p-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>RUN FULL ASSESSMENT</span>
            </h3>
            <p className="text-xs font-bold text-neutral-900 leading-relaxed">
              Run a complete, 360° financial eligibility assessment matching against real lender rules.
            </p>
            <div>
              <Link href="/assessment">
                <NeoButton variant="black" size="sm">
                  <span>START ASSESSMENT</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </NeoButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
