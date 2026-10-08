"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Calculator, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
  initialLoanAmount = 2500000,
  initialInterestRate = 10.5,
  initialTenureMonths = 120,
  initialMonthlyIncome = 120000,
  initialExistingObligations = 15000,
  onSimulationChange,
}: FoirSimulatorProps) {
  const [loanAmount, setLoanAmount] = useState<number>(initialLoanAmount);
  const [interestRate, setInterestRate] = useState<number>(initialInterestRate);
  const [tenureYears, setTenureYears] = useState<number>(Math.round(initialTenureMonths / 12));
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialMonthlyIncome);
  const [existingObligations, setExistingObligations] = useState<number>(initialExistingObligations);

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
      suggestions.push("FOIR is within standard NBFC/Private Bank limits; consider Prime PSU lenders.");
    } else {
      suggestions.push("Optimal FOIR profile. Maximum eligibility across top-tier education loan lenders.");
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


  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "Safe":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Moderate":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "Stretched":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-foreground">Interactive FOIR & EMI Simulator</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulate education loan terms and see live impact on monthly debt capacity and FOIR.
          </p>
        </div>
        {result && (
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Risk Assessment
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getBadgeStyle(
                result.status_badge
              )}`}
            >
              {result.status_badge} ({result.foir_percentage}%)
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loan Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">
                Required Loan Amount
              </label>
              <span className="text-base font-bold font-mono text-primary">
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
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>₹2 Lakhs</span>
              <span>₹50 Lakhs</span>
              <span>₹1.5 Crores</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">
                Expected Interest Rate (p.a.)
              </label>
              <span className="text-base font-bold font-mono text-primary">
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
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>7.5% (PSU Concession)</span>
              <span>11.0% (Private)</span>
              <span>16.5% (Unsecured NBFC)</span>
            </div>
          </div>

          {/* Loan Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">
                Repayment Tenure
              </label>
              <span className="text-base font-bold font-mono text-primary">
                {tenureYears} Years ({tenureMonths} Months)
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>3 Years</span>
              <span>7 Years</span>
              <span>15 Years</span>
            </div>
          </div>

          {/* Monthly Income Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Co-borrower Monthly Net Income (₹)
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm font-mono focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Existing Monthly Loan EMIs (₹)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={existingObligations}
                onChange={(e) => setExistingObligations(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Metrics Receipt Column */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-secondary/30 p-6 border border-border">
          {result && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Calculated Metrics Receipt
              </h3>

              <div className="space-y-3 divide-y divide-border/60">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">Simulated Loan EMI</span>
                  <span className="text-base font-bold font-mono text-primary">
                    {formatCurrency(result.simulated_emi_inr)}
                    <span className="text-xs text-muted-foreground font-normal">/mo</span>
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-muted-foreground">Total Monthly Obligations</span>
                  <span className="text-sm font-bold font-mono text-foreground">
                    {formatCurrency(result.total_monthly_obligations_inr)}
                    <span className="text-xs text-muted-foreground font-normal">/mo</span>
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-muted-foreground">Calculated FOIR Ratio</span>
                  <span className="text-sm font-bold font-mono text-foreground">
                    {result.foir_percentage}%
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-muted-foreground">Max Affordable EMI (50% cap)</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {formatCurrency(result.max_affordable_emi_inr)}
                  </span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span>Affordability Recommendations:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {result.remedial_suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
