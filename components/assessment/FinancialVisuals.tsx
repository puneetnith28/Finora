"use client";

import React, { useState } from "react";
import { Wallet, TrendingUp, PiggyBank, Building, PieChart, BarChart3 } from "lucide-react";
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
  netWorthInr = 0,
  totalEligibleCollateralInr = 0,
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
    {
      label: "Tuition & Academic Fees",
      amount: tuition,
      color: "bg-[#86EFAC]",
      hex: "#86EFAC",
      percent: totalCostInr > 0 ? (tuition / totalCostInr) * 100 : 65,
    },
    {
      label: "Living, Housing & Food",
      amount: living,
      color: "bg-[#BAE6FD]",
      hex: "#BAE6FD",
      percent: totalCostInr > 0 ? (living / totalCostInr) * 100 : 25,
    },
    {
      label: "Travel, Health & Buffer",
      amount: other,
      color: "bg-[#FEF08A]",
      hex: "#FEF08A",
      percent: totalCostInr > 0 ? (other / totalCostInr) * 100 : 10,
    },
  ];

  // Derive funding breakdown
  const fundingGap = Math.max(0, fundingGapInr);
  const totalCovered = totalFundingInr || scholarshipInr + familyContributionInr;
  const selfSavings = familyContributionInr || Math.round(totalCovered * 0.7);
  const scholarship = scholarshipInr || Math.round(totalCovered * 0.3);

  const fundingItems = [
    {
      label: "Education Loan Required",
      amount: fundingGap,
      color: "bg-[#FECDD3]",
      hex: "#FECDD3",
      percent: totalCostInr > 0 ? (fundingGap / totalCostInr) * 100 : 70,
    },
    {
      label: "Family Savings & Capital",
      amount: selfSavings,
      color: "bg-[#86EFAC]",
      hex: "#86EFAC",
      percent: totalCostInr > 0 ? (selfSavings / totalCostInr) * 100 : 20,
    },
    {
      label: "Scholarships & Grants",
      amount: scholarship,
      color: "bg-[#BAE6FD]",
      hex: "#BAE6FD",
      percent: totalCostInr > 0 ? (scholarship / totalCostInr) * 100 : 10,
    },
  ];

  const collateral = totalEligibleCollateralInr;

  return (
    <div className="neo-box p-6 sm:p-8 bg-[#FFFDF9] space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="inline-block bg-[#BAE6FD] text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-1">
            FINANCIAL INTELLIGENCE
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-black stroke-[2.5]" />
            <span>Interactive Breakdown Visualizer</span>
          </h3>
          <p className="text-xs sm:text-sm font-bold text-black/70">
            Capital allocation, study expense distribution, and debt-to-equity ratios.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("cost")}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
              activeTab === "cost"
                ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
                : "bg-white text-black hover:bg-[#F3F4F6]"
            }`}
          >
            Study Budget
          </button>
          <button
            onClick={() => setActiveTab("funding")}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
              activeTab === "funding"
                ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
                : "bg-white text-black hover:bg-[#F3F4F6]"
            }`}
          >
            Funding Gap
          </button>
          <button
            onClick={() => setActiveTab("networth")}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
              activeTab === "networth"
                ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
                : "bg-white text-black hover:bg-[#F3F4F6]"
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
            <span className="text-xs uppercase font-black tracking-wider text-black/70">
              Total Program Cost
            </span>
            <span className="text-2xl font-black font-mono text-black">
              {formatCurrency(totalCostInr)}
            </span>
          </div>

          {/* Stacked Multi-Segment Bar */}
          <div className="h-6 w-full bg-white border-2 border-black overflow-hidden flex shadow-[3px_3px_0px_#000000]">
            {costItems.map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} h-full border-r-2 last:border-r-0 border-black transition-all duration-300 hover:opacity-90 cursor-pointer`}
                style={{ width: `${Math.max(item.percent, 3)}%` }}
                title={`${item.label}: ${formatCurrency(item.amount)} (${item.percent.toFixed(1)}%)`}
              />
            ))}
          </div>

          {/* Visual Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {costItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000000] ${item.color} space-y-1`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black border border-black shrink-0" />
                  <span className="text-xs font-black uppercase text-black">{item.label}</span>
                </div>
                <div className="text-xl font-black font-mono text-black">
                  {formatCurrency(item.amount)}
                </div>
                <span className="text-[11px] font-bold text-black/80 font-mono block">
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
            <span className="text-xs uppercase font-black tracking-wider text-black/70">
              Net Financing Requirement
            </span>
            <span className="text-2xl font-black font-mono text-black">
              {formatCurrency(fundingGap)} Loan Needed
            </span>
          </div>

          {/* Stacked Multi-Segment Bar */}
          <div className="h-6 w-full bg-white border-2 border-black overflow-hidden flex shadow-[3px_3px_0px_#000000]">
            {fundingItems.map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} h-full border-r-2 last:border-r-0 border-black transition-all duration-300 hover:opacity-90 cursor-pointer`}
                style={{ width: `${Math.max(item.percent, 3)}%` }}
                title={`${item.label}: ${formatCurrency(item.amount)} (${item.percent.toFixed(1)}%)`}
              />
            ))}
          </div>

          {/* Visual Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {fundingItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000000] ${item.color} space-y-1`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black border border-black shrink-0" />
                  <span className="text-xs font-black uppercase text-black">{item.label}</span>
                </div>
                <div className="text-xl font-black font-mono text-black">
                  {formatCurrency(item.amount)}
                </div>
                <span className="text-[11px] font-bold text-black/80 font-mono block">
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
          <div className="p-4 bg-[#86EFAC] border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2">
            <div className="flex items-center gap-2 text-black">
              <PiggyBank className="h-5 w-5 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">
                Candidate Net Worth
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-black">
              {formatCurrency(netWorthInr)}
            </div>
            <span className="text-[11px] font-bold text-black/80 block">
              Total Family Assets less Existing Liabilities
            </span>
          </div>

          <div className="p-4 bg-[#BAE6FD] border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2">
            <div className="flex items-center gap-2 text-black">
              <Building className="h-5 w-5 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">
                Eligible Collateral
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-black">
              {formatCurrency(collateral)}
            </div>
            <span className="text-[11px] font-bold text-black/80 block">
              Assessed value after bank haircut factors
            </span>
          </div>

          <div className="p-4 bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2">
            <div className="flex items-center gap-2 text-black">
              <Wallet className="h-5 w-5 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">
                Asset Cushion Ratio
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-black">
              {totalCostInr > 0 ? `${((netWorthInr / totalCostInr) * 100).toFixed(0)}%` : "N/A"}
            </div>
            <span className="text-[11px] font-bold text-black/80 block">
              Net worth coverage against total program budget
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
