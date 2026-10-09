"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Calculator, Info } from "lucide-react";
import { NeoBadge, NeoInput } from "@/components/ui/NeoPrimitives";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_SIMULATOR_PARAMS } from "@/lib/constants/financial";

interface SimulatorResult {
  loan_amount_inr: number;
  annual_interest_rate_percent: number;
  tenure_months: number;
  monthly_income_inr: number;
  existing_obligations_inr: number;
  simulated_emi_inr: number;
  total_monthly_obligations_inr: number;
  foir_ratio: number;
  foir_percentage: number;
  status_badge: "Safe" | "Moderate" | "Stretched" | "High Risk" | string;
  max_affordable_emi_inr: number;
  remedial_suggestions: string[];
}

interface FoirSimulatorProps {
  initialLoanAmount?: number;
  initialInterestRate?: number;
  initialTenureMonths?: number;
  initialMonthlyIncome?: number;
  initialExistingObligations?: number;
  onSimulationChange?: (result: SimulatorResult) => void;
}

export function FoirSimulator({
  initialLoanAmount = DEFAULT_SIMULATOR_PARAMS.loanAmount,
  initialInterestRate = DEFAULT_SIMULATOR_PARAMS.interestRate,
  initialTenureMonths = DEFAULT_SIMULATOR_PARAMS.tenureMonths,
  initialMonthlyIncome = DEFAULT_SIMULATOR_PARAMS.monthlyIncome,
  initialExistingObligations = DEFAULT_SIMULATOR_PARAMS.existingObligations,
  onSimulationChange,
}: FoirSimulatorProps) {
  const [loanAmount, setLoanAmount] = useState<number>(initialLoanAmount);
  const [interestRate, setInterestRate] = useState<number>(initialInterestRate);
  const [tenureYears, setTenureYears] = useState<number>(Math.round(initialTenureMonths / 12));
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialMonthlyIncome);
  const [existingObligations, setExistingObligations] = useState<number>(
    initialExistingObligations
  );

  const tenureMonths = tenureYears * 12;

  // Real-time client calculation via useMemo
  const result = useMemo<SimulatorResult>(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureMonths;

    let emi = 0;
    if (r > 0 && n > 0 && P > 0) {
      const compound = Math.pow(1 + r, n);
      emi = (P * r * compound) / (compound - 1);
    }

    const totalObligations = existingObligations + emi;
    const foirPct = monthlyIncome > 0 ? (totalObligations / monthlyIncome) * 100 : 100;

    let badge = "Safe";
    if (foirPct > 60) badge = "High Risk";
    else if (foirPct > 50) badge = "Stretched";
    else if (foirPct > 40) badge = "Moderate";

    const maxTotalAllowed = monthlyIncome * 0.5;
    const maxAffordableEmi = Math.max(0, maxTotalAllowed - existingObligations);

    const suggestions: string[] = [];
    if (foirPct > 50) {
      suggestions.push("Extend loan tenure (e.g. 10 to 15 years) to lower monthly EMI burden.");
      suggestions.push("Add a co-borrower (parents/spouse) to expand monthly household income.");
      suggestions.push("Prepay or clear existing personal loans to free up FOIR capacity.");
    } else if (foirPct > 40) {
      suggestions.push(
        "FOIR is within standard NBFC/Private Bank limits; consider Prime PSU lenders."
      );
    } else {
      suggestions.push(
        "Optimal FOIR profile. Maximum eligibility across top-tier education loan lenders."
      );
    }

    return {
      loan_amount_inr: P,
      annual_interest_rate_percent: interestRate,
      tenure_months: n,
      monthly_income_inr: monthlyIncome,
      existing_obligations_inr: existingObligations,
      simulated_emi_inr: Math.round(emi),
      total_monthly_obligations_inr: Math.round(totalObligations),
      foir_ratio: Math.round((foirPct / 100) * 10000) / 10000,
      foir_percentage: Math.round(foirPct * 10) / 10,
      status_badge: badge,
      max_affordable_emi_inr: Math.round(maxAffordableEmi),
      remedial_suggestions: suggestions,
    };
  }, [loanAmount, interestRate, tenureMonths, monthlyIncome, existingObligations]);

  useEffect(() => {
    if (onSimulationChange) {
      onSimulationChange(result);
    }
  }, [result, onSimulationChange]);

  return (
    <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-black">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <NeoBadge variant="pink" rotate="left">
              REAL-TIME STRESS TEST
            </NeoBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
            INTERACTIVE FOIR & EMI SIMULATOR
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-700">
            Simulate loan sizing, interest slabs, and co-borrower income to test lender rule
            impacts.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <NeoBadge
              variant={
                result.status_badge === "Safe"
                  ? "mint"
                  : result.status_badge === "Moderate"
                    ? "cyan"
                    : result.status_badge === "Stretched"
                      ? "yellow"
                      : "pink"
              }
            >
              {result.status_badge.toUpperCase()} ({result.foir_percentage}%)
            </NeoBadge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loan Amount Slider */}
          <div className="neo-box p-4 bg-[#FAF8F5] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                Required Loan Amount
              </label>
              <span className="text-sm font-black font-mono text-black border-2 border-black bg-[#FEF08A] px-2 py-0.5">
                {formatCurrency(loanAmount)}
              </span>
            </div>
            <input
              type="range"
              min={200000}
              max={15000000}
              step={50000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-3 border-2 border-black bg-white appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-600">
              <span>₹2 Lakhs</span>
              <span>₹50 Lakhs</span>
              <span>₹1.5 Crores</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="neo-box p-4 bg-[#FAF8F5] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                Interest Rate (p.a.)
              </label>
              <span className="text-sm font-black font-mono text-black border-2 border-black bg-[#BAE6FD] px-2 py-0.5">
                {interestRate.toFixed(2)}%
              </span>
            </div>
            <input
              type="range"
              min={7.5}
              max={16.5}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-3 border-2 border-black bg-white appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-600">
              <span>7.5% (PSU Slabs)</span>
              <span>11.0% (Private)</span>
              <span>16.5% (NBFC Unsecured)</span>
            </div>
          </div>

          {/* Loan Tenure Slider */}
          <div className="neo-box p-4 bg-[#FAF8F5] space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                Repayment Tenure
              </label>
              <span className="text-sm font-black font-mono text-black border-2 border-black bg-[#86EFAC] px-2 py-0.5">
                {tenureYears} Years ({tenureMonths} Mo)
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-3 border-2 border-black bg-white appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-600">
              <span>3 Years</span>
              <span>7 Years</span>
              <span>15 Years</span>
            </div>
          </div>

          {/* Monthly Income & Debt Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoInput
              label="Monthly Net Income (₹)"
              type="number"
              min={0}
              step={5000}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
            />

            <NeoInput
              label="Existing Monthly EMIs (₹)"
              type="number"
              min={0}
              step={1000}
              value={existingObligations}
              onChange={(e) => setExistingObligations(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>

        {/* Live Metrics Receipt Column */}
        <div className="lg:col-span-5 flex flex-col justify-between neo-box bg-[#FAF8F5] p-6 space-y-5">
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
                <Calculator className="h-4 w-4 text-black" />
                <h3 className="font-black text-xs uppercase tracking-wider text-black">
                  CALCULATED METRICS RECEIPT
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-bold">
                <div className="flex justify-between items-center py-1 border-b border-black">
                  <span className="text-neutral-600">Simulated Loan EMI</span>
                  <span className="font-mono text-black font-black text-sm">
                    {formatCurrency(result.simulated_emi_inr)}/mo
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black">
                  <span className="text-neutral-600">Total Monthly Debt</span>
                  <span className="font-mono text-black">
                    {formatCurrency(result.total_monthly_obligations_inr)}/mo
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black">
                  <span className="text-neutral-600">Calculated FOIR</span>
                  <span className="font-mono text-black font-black">{result.foir_percentage}%</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black">
                  <span className="text-neutral-600">Max Affordable EMI (50% Cap)</span>
                  <span className="font-mono text-black">
                    {formatCurrency(result.max_affordable_emi_inr)}
                  </span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="p-3 bg-[#FEF08A] border-2 border-black space-y-1 text-xs font-bold shadow-[2px_2px_0px_0px_#000000]">
                <div className="flex items-center gap-1 font-black text-black uppercase mb-1">
                  <Info className="h-3.5 w-3.5" />
                  <span>AFFORDABILITY ADVICE:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-neutral-900">
                  {result.remedial_suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Lender Impact Simulation Grid */}
      <div className="pt-8 border-t-2 border-black space-y-4">
        <div>
          <NeoBadge variant="cyan">LIVE LENDER IMPACT</NeoBadge>
          <h3 className="text-xl font-black text-black uppercase tracking-tight mt-1">
            LENDER ELIGIBILITY TRANSITION MATRIX
          </h3>
          <p className="text-xs font-bold text-neutral-700 mt-0.5">
            See how simulated loan amounts, interest rates, and FOIR ratios change eligibility
            across active lenders in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 1,
              name: "SBI Global Ed-Vantage",
              type: "Public Sector (Collateral Req)",
              maxFoir: 50,
              maxLoan: 15000000,
              minIncome: 50000,
            },
            {
              id: 2,
              name: "Bank of Baroda Scholar",
              type: "Public Sector Bank",
              maxFoir: 55,
              maxLoan: 15000000,
              minIncome: 45000,
            },
            {
              id: 3,
              name: "HDFC Credila",
              type: "Specialist Education NBFC",
              maxFoir: 60,
              maxLoan: 10000000,
              minIncome: 35000,
            },
            {
              id: 4,
              name: "Auxilo Finserve",
              type: "Modern NBFC (Flexible Cap)",
              maxFoir: 65,
              maxLoan: 7500000,
              minIncome: 30000,
            },
          ].map((lender) => {
            const foirPct = result ? result.foir_percentage : 30;
            const P = loanAmount;
            const inc = monthlyIncome;

            const baselineFoir = 35;
            const baselineLoan = 2000000;

            const baseMatch =
              baselineFoir <= lender.maxFoir &&
              baselineLoan <= lender.maxLoan &&
              inc >= lender.minIncome;
            const baseStatus = baseMatch ? "Potential Match" : "Needs Review";

            let simStatus = "Potential Match";
            let delta = "Unchanged";
            let reason = "All criteria met within simulated parameters.";

            if (P > lender.maxLoan) {
              simStatus = "Not Eligible";
              reason = `Requested ${formatCurrency(P)} exceeds lender cap of ${formatCurrency(lender.maxLoan)}.`;
            } else if (foirPct > lender.maxFoir) {
              simStatus = "Needs Review";
              reason = `FOIR ${foirPct}% exceeds lender maximum threshold of ${lender.maxFoir}%.`;
            } else if (inc < lender.minIncome) {
              simStatus = "Needs Review";
              reason = `Co-borrower income ${formatCurrency(inc)} is below required ${formatCurrency(lender.minIncome)}.`;
            }

            if (baseStatus !== simStatus) {
              if (simStatus === "Potential Match") delta = "Upgraded";
              else delta = "Downgraded";
            }

            return (
              <div
                key={lender.id}
                className="neo-box p-4 bg-white flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-black text-black uppercase line-clamp-1">
                      {lender.name}
                    </span>
                    <NeoBadge
                      variant={
                        simStatus === "Potential Match"
                          ? "mint"
                          : simStatus === "Needs Review"
                            ? "yellow"
                            : "pink"
                      }
                    >
                      {simStatus === "Potential Match"
                        ? "MATCH"
                        : simStatus === "Needs Review"
                          ? "REVIEW"
                          : "FAIL"}
                    </NeoBadge>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 block">
                    {lender.type}
                  </span>

                  <div className="mt-2.5 pt-2.5 border-t-2 border-black space-y-1 text-[11px] font-bold">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Baseline:</span>
                      <span className="text-black">{baseStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Transition:</span>
                      <span className="text-black font-black uppercase">{delta}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] font-bold text-neutral-800 bg-[#FAF8F5] p-2 border border-black">
                  {reason}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
