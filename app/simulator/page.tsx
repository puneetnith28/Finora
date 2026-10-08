import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FoirSimulator } from "@/components/simulator/FoirSimulator";
import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "FOIR & Education Loan EMI Simulator | Finora",
  description:
    "Simulate education loan terms, analyze Fixed Obligation to Income Ratio (FOIR), and evaluate borrowing capacity.",
};

export default function SimulatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real-Time Debt Affordability Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Loan EMI & FOIR Simulator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Adjust loan amounts, interest rates, and household income to see instant debt burden
            metrics, maximum sanction headroom, and lender threshold compliance.
          </p>
        </div>

        <FoirSimulator />

        {/* Informational Callout */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-border bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              What is FOIR?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Fixed Obligation to Income Ratio (FOIR) measures what percentage of the co-borrower’s monthly
              income goes toward all debt obligations including the new education loan EMI.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Lender Benchmarks
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Leading PSU lenders and private banks cap FOIR between <strong>40% to 50%</strong>.
              Higher FOIR (&gt; 50%) requires additional collateral, longer tenure, or co-borrower additions.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Ready for Full Assessment?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Run a complete, 360° financial eligibility assessment matching against real lender rules.
            </p>
            <div className="mt-3">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Start Assessment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
