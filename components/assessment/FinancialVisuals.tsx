"use client";

import React, { useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Building 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface FinancialVisualsProps {
  totalCostInr: number;
  totalFundingInr: number;
  fundingGapInr: number;
  netWorthInr?: number;
  totalEligibleCollateralInr?: number;
  tuitionFeeInr?: number;
  livingExpensesInr?: number;
  otherExpensesInr?: number;
  scholarshipInr?: number;
  familyContributionInr?: number;
}

export function FinancialVisuals({
  totalCostInr,
  totalFundingInr,
  fundingGapInr,
  netWorthInr = 1500000,
  totalEligibleCollateralInr = 2500000,
  tuitionFeeInr,
  livingExpensesInr,
  otherExpensesInr,
  scholarshipInr = 0,
  familyContributionInr = 0,
}: FinancialVisualsProps) {
  const [activeTab, setActiveTab] = useState<"cost" | "funding" | "networth">("cost");

  // Derive estimated cost breakdown if specific subcomponents are not explicitly passed
  const tuition = tuitionFeeInr ?? Math.round(totalCostInr * 0.65);
  const living = livingExpensesInr ?? Math.round(totalCostInr * 0.25);
  const other = otherExpensesInr ?? Math.max(0, totalCostInr - tuition - living);

  const costItems = [
    { label: "Tuition & Academic Fees", amount: tuition, color: "bg-emerald-500", hex: "#10b981", percent: totalCostInr > 0 ? (tuition / totalCostInr) * 100 : 65 },
    { label: "Living, Housing & Food", amount: living, color: "bg-blue-500", hex: "#3b82f6", percent: totalCostInr > 0 ? (living / totalCostInr) * 100 : 25 },
    { label: "Travel, Health & Buffer", amount: other, color: "bg-amber-500", hex: "#f59e0b", percent: totalCostInr > 0 ? (other / totalCostInr) * 100 : 10 },
  ];

  // Derive funding breakdown
  const fundingGap = Math.max(0, fundingGapInr);
  const totalCovered = totalFundingInr || (scholarshipInr + familyContributionInr);
  const selfSavings = familyContributionInr || Math.round(totalCovered * 0.7);
  const scholarship = scholarshipInr || Math.round(totalCovered * 0.3);

  const fundingItems = [
    { label: "Education Loan Required", amount: fundingGap, color: "bg-rose-500", hex: "#f43f5e", percent: totalCostInr > 0 ? (fundingGap / totalCostInr) * 100 : 70 },
    { label: "Family Savings & Margin Money", amount: selfSavings, color: "bg-emerald-500", hex: "#10b981", percent: totalCostInr > 0 ? (selfSavings / totalCostInr) * 100 : 20 },
    { label: "Scholarships & Grants", amount: scholarship, color: "bg-purple-500", hex: "#a855f7", percent: totalCostInr > 0 ? (scholarship / totalCostInr) * 100 : 10 },
  ];

  // Net Worth & Assets breakdown
  const collateral = totalEligibleCollateralInr;

  return (
    <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span>Interactive Financial Breakdown Visualizer</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit capital allocation, study expense distribution, and debt-to-equity ratios.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("cost")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "cost"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Study Budget
          </button>
          <button
            onClick={() => setActiveTab("funding")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "funding"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Funding Gap
          </button>
          <button
            onClick={() => setActiveTab("networth")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "networth"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Net Worth & Assets
          </button>
        </div>
      </div>

      {/* Tab 1: Study Budget Breakdown */}
      {activeTab === "cost" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs uppercase font-bold text-slate-500">Total Program Cost</span>
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalCostInr)}
            </span>
          </div>

          {/* Stacked Multi-Segment Bar */}
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            {costItems.map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-90 cursor-pointer`}
                style={{ width: `${Math.max(item.percent, 2)}%` }}
                title={`${item.label}: ${formatCurrency(item.amount)} (${item.percent.toFixed(1)}%)`}
              />
            ))}
          </div>

          {/* Visual Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {costItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {formatCurrency(item.amount)}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.percent.toFixed(1)}% of total cost
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Funding Coverage & Gap Breakdown */}
      {activeTab === "funding" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs uppercase font-bold text-slate-500">
              Net Financing Requirement
            </span>
            <span className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(fundingGap)} Needed
            </span>
          </div>

          {/* Stacked Multi-Segment Bar */}
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            {fundingItems.map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-90 cursor-pointer`}
                style={{ width: `${Math.max(item.percent, 2)}%` }}
                title={`${item.label}: ${formatCurrency(item.amount)} (${item.percent.toFixed(1)}%)`}
              />
            ))}
          </div>

          {/* Visual Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {fundingItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {formatCurrency(item.amount)}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.percent.toFixed(1)}% of budget
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Net Worth & Balance Sheet */}
      {activeTab === "networth" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Candidate Net Worth</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
              {formatCurrency(netWorthInr)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Calculated as Total Family Assets less Existing Liabilities
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Building className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Eligible Collateral</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
              {formatCurrency(collateral)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Assessed value after bank haircut factors
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Asset Cushion Ratio</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
              {totalCostInr > 0 ? `${((netWorthInr / totalCostInr) * 100).toFixed(0)}%` : "N/A"}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Net worth coverage against total program budget
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
