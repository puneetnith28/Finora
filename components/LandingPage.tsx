"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Building2, 
  FileCheck2, 
  Sparkles,
  Lock,
  Layers,
  Percent,
  Check,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { DemoScenarioSelector } from "./demo/DemoScenarioSelector";

export function LandingPage() {
  // Interactive preview state for demoing the deterministic engine on the hero
  const [demoTuition, setDemoTuition] = useState<number>(3500000);
  const demoLiving = 1200000;
  const [demoSavings, setDemoSavings] = useState<number>(1000000);
  const [demoIncome, setDemoIncome] = useState<number>(120000);
  const demoExistingEmi = 15000;

  const totalCost = demoTuition + demoLiving;
  const fundingGap = Math.max(0, totalCost - demoSavings);
  // Estimated EMI for funding gap over 10 years at 10.5%
  const monthlyRate = 10.5 / 12 / 100;
  const tenureMonths = 120;
  const estimatedEmi =
    fundingGap > 0
      ? (fundingGap * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      : 0;
  const totalMonthlyObligation = demoExistingEmi + estimatedEmi;
  const foir = demoIncome > 0 ? (totalMonthlyObligation / demoIncome) * 100 : 0;
  const readinessBand =
    foir <= 50 ? "Strong Readiness" : foir <= 65 ? "Conditional" : "High FOIR Risk";

  return (
    <div className="flex flex-col gap-24 py-8 sm:py-16">
      {/* 1. HERO SECTION: Product Showcase */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Glow background accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left: Editorial Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Deterministic Education Loan Underwriting Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Know your loan readiness <br />
              <span className="text-[#0f382c] dark:text-emerald-400 underline decoration-emerald-400/40 decoration-wavy underline-offset-8">
                before you apply.
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Eliminate guesswork. Finora normalizes cross-border currencies, stress-tests 
              co-borrower FOIR against strict RBI & NBFC rules, evaluates collateral LTV, and gives you 
              a <strong>100% transparent audit trail</strong> of matched lenders.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/assessment">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start 6-Step Assessment
                </Button>
              </Link>
              <Link href="/lenders">
                <Button variant="outline" size="lg" leftIcon={<Building2 className="h-4 w-4" />}>
                  View Lender Rules Matrix
                </Button>
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Hidden Rules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Multi-Currency FX</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>No Credit Score Impact</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Interactive Engine Showcase */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Live Engine Simulation
                  </span>
                </div>
                <Badge
                  variant={
                    readinessBand === "Strong Readiness"
                      ? "success"
                      : readinessBand === "Conditional"
                      ? "warning"
                      : "danger"
                  }
                >
                  {readinessBand}
                </Badge>
              </div>

              {/* Interactive Micro Sliders */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Total Study Cost</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="8000000"
                    step="200000"
                    value={demoTuition}
                    onChange={(e) => setDemoTuition(Number(e.target.value))}
                    className="w-full accent-[#0f382c] dark:accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Self & Family Funding</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(demoSavings)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4000000"
                    step="100000"
                    value={demoSavings}
                    onChange={(e) => setDemoSavings(Number(e.target.value))}
                    className="w-full accent-[#0f382c] dark:accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Co-borrower Monthly Income</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(demoIncome)}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="300000"
                    step="10000"
                    value={demoIncome}
                    onChange={(e) => setDemoIncome(Number(e.target.value))}
                    className="w-full accent-[#0f382c] dark:accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Realtime Output Card */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Required Loan (Gap)
                    </span>
                    <span className="text-lg font-bold font-mono text-[#0f382c] dark:text-emerald-400">
                      {formatCurrency(fundingGap)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Projected FOIR
                    </span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        foir <= 50
                          ? "text-emerald-600 dark:text-emerald-400"
                          : foir <= 65
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formatPercent(foir)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">
                    Est. Monthly EMI: <strong className="font-mono">{formatCurrency(estimatedEmi)}</strong>
                  </span>
                  <Link
                    href="/assessment"
                    className="text-[#0f382c] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Run Full Assessment
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviewer Demo Fast-Track Scenarios */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <DemoScenarioSelector />
      </section>

      {/* 2. WHAT THE TOOL DOES: 4 Core Pillars */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <Badge variant="primary">Platform Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for complete loan transparency
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Education loan approvals fail when students lack visibility into bank underwriting logic. 
            Finora implements the exact rules used by credit committees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Card className="hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Multi-Currency Normalization
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Convert tuition in USD, EUR, GBP, or CAD into normalized INR budgets with real-time 
                safe buffers for tuition inflation and foreign exchange swings.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              FX BUFFER + COST BREAKDOWN
            </div>
          </Card>

          {/* Card 2 */}
          <Card className="hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                <Percent className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Deterministic FOIR Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calculate Fixed Obligation to Income Ratio (FOIR) strictly following RBI banking norms. 
                Identify if co-borrower debt limits loan sizing before submitting.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-blue-700 dark:text-blue-400 font-semibold">
              HARD 50% / 65% STRESS THRESHOLDS
            </div>
          </Card>

          {/* Card 3 */}
          <Card className="hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Collateral LTV & Haircuts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Applies standard bank haircuts (80% for residential property, 70% commercial, 90% fixed deposits) 
                and computes Loan-to-Value constraints.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
              ELIGIBLE VALUE & ENCUMBRANCE DEDUCTION
            </div>
          </Card>

          {/* Card 4 */}
          <Card className="hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Audit Trail Transparency
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Never wonder why a loan failed. Inspect exact rule checks—CIBIL scores, stem courses, 
                country tiers, and maximum loan amounts per lender.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-purple-700 dark:text-purple-400 font-semibold">
              NO OPAQUE BLACK-BOX SCORES
            </div>
          </Card>
        </div>
      </section>

      {/* 3. HOW IT WORKS: 4-Step Process Flow */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-slate-100/70 dark:bg-slate-900/40 py-16 rounded-3xl border border-slate-200/60 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <Badge variant="default">Process Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Finora evaluates your readiness
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            A linear, auditable path from admission letter to lender sanction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f382c] text-white font-mono font-bold text-base shadow-sm">
                01
              </span>
              <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 hidden md:block" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Profile & University
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter your destination country, university, degree, and stem classification. 
              We map lender approval lists automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f382c] text-white font-mono font-bold text-base shadow-sm">
                02
              </span>
              <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 hidden md:block" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Budget & Funding
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Input tuition, living expenses, and family self-funding to calculate the precise net 
              borrowing gap required in INR.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f382c] text-white font-mono font-bold text-base shadow-sm">
                03
              </span>
              <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 hidden md:block" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Underwriting Verification
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Stress-test monthly co-borrower FOIR, add collateral assets for higher loan amounts, 
              and inspect document checklist readiness.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-mono font-bold text-base shadow-sm">
                04
              </span>
              <div className="h-0.5 flex-1 bg-emerald-500/20 hidden md:block" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Instant Match Audit
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive clear eligibility states (Eligible, Conditional, Ineligible) with exact rule breakdown 
              and remediation advice.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LENDER MATCHING PREVIEW */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge variant="primary">Lender Rules Matrix</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Transparent Multi-Lender Evaluation
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-xl">
              Preview how our rule engine matches student profiles against top Indian public banks, 
              private NBFCs, and international USD lenders.
            </p>
          </div>
          <Link href="/lenders">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
              Explore Full Ruleset
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lender 1: SBI Global Ed-Vantage */}
          <Card className="border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Public Sector Bank
              </span>
              <Badge variant="success">Eligible</Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              State Bank of India (Global Ed-Vantage)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Low-cost secured education loan for premier overseas universities.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Interest Rate:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">9.15% - 10.50%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Loan Amount:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹1.50 Crore</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collateral Policy:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">100% Tangible Required</span>
              </div>
            </div>

            <div className="mt-5 bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Passed: CIBIL &gt; 700, Collateral LTV &lt; 80%</span>
              </div>
            </div>
          </Card>

          {/* Lender 2: HDFC Credila */}
          <Card className="border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Specialized NBFC
              </span>
              <Badge variant="warning">Conditional</Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              HDFC Credila Financial Services
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Flexible customized loans with partial collateral and co-borrower options.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Interest Rate:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">10.50% - 12.75%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Unsecured:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹50.00 Lakhs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FOIR Max Cap:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">60.0% Hard Limit</span>
              </div>
            </div>

            <div className="mt-5 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl text-xs space-y-1 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Condition: Co-borrower IT returns &gt; ₹8 LPA</span>
              </div>
            </div>
          </Card>

          {/* Lender 3: Prodigy Finance */}
          <Card className="border-t-4 border-t-purple-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                International (USD)
              </span>
              <Badge variant="primary">Eligible</Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Prodigy Finance (Borderless)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No collateral and no Indian co-signer required for top STEM / MBA programs.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Interest Rate:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">11.25% - 14.50% (USD)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collateral Required:</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">None ($0)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course Eligibility:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Ranked STEM & Business</span>
              </div>
            </div>

            <div className="mt-5 bg-purple-50 dark:bg-purple-950/50 p-3 rounded-xl text-xs space-y-1 text-purple-900 dark:text-purple-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Passed: Program in Tier-1 Global Target List</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. DOCUMENT VAULT PREVIEW */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="info">Document Vault</Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Know exact verification proofs before visiting bank branches
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Banks reject applications when documents don&apos;t match income or collateral claims. 
                Finora identifies required documentation based on whether you are using salaried co-borrowers, 
                business IT returns, immovable property deeds, or scholarship awards.
              </p>
              <div className="pt-2">
                <Link href="/documents">
                  <Button variant="secondary" size="md" leftIcon={<FileCheck2 className="h-4 w-4" />}>
                    Open Document Readiness Vault
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Admission Offer Letter</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Co-Borrower 2-Yr ITR + Form 16</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">6-Month Bank Statement</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Property Title Deed / Encumbrance</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HIGH IMPACT CALL TO ACTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-[#0f382c] px-6 py-16 text-center text-white sm:px-16 shadow-2xl">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative mx-auto max-w-2xl space-y-6">
            <span className="inline-block rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
              Ready to verify your readiness?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Start your deterministic assessment now
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
              Complete your student profile, study plan, and financials in less than 5 minutes. 
              Get your reproducible lender audit report instantly.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/assessment">
                <Button
                  size="lg"
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold w-full sm:w-auto shadow-lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Start Assessment Flow
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
