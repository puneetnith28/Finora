"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Sparkles,
  Percent,
  ShieldCheck
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";

interface LenderRule {
  rule_id: string;
  rule_name: string;
  rule_type: string;
  threshold: unknown;
  severity: string;
}

interface LenderItem {
  id: number;
  name: string;
  lender_type: string;
  interest_rate_min: number;
  interest_rate_max: number;
  max_loan_amount_inr: number;
  min_cibil_score: number;
  requires_collateral: boolean;
  active: boolean;
  supported_countries?: string[];
  rules?: LenderRule[];
}

export default function LendersPage() {
  const [lenders, setLenders] = useState<LenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    async function loadLenders() {
      try {
        const data = await api.get<LenderItem[]>("/api/lenders");
        setLenders(data);
      } catch {
        // Fallback demo lenders
        setLenders([
          {
            id: 1,
            name: "State Bank of India (Global Ed-Vantage)",
            lender_type: "public_bank",
            interest_rate_min: 9.15,
            interest_rate_max: 10.5,
            max_loan_amount_inr: 15000000,
            min_cibil_score: 700,
            requires_collateral: true,
            active: true,
          },
          {
            id: 2,
            name: "HDFC Credila Financial Services",
            lender_type: "nbfc",
            interest_rate_min: 10.5,
            interest_rate_max: 12.75,
            max_loan_amount_inr: 7500000,
            min_cibil_score: 680,
            requires_collateral: false,
            active: true,
          },
          {
            id: 3,
            name: "Prodigy Finance (Borderless USD)",
            lender_type: "international_usd",
            interest_rate_min: 11.25,
            interest_rate_max: 14.5,
            max_loan_amount_inr: 10000000,
            min_cibil_score: 0,
            requires_collateral: false,
            active: true,
          },
          {
            id: 4,
            name: "Avanse Financial Services",
            lender_type: "nbfc",
            interest_rate_min: 11.0,
            interest_rate_max: 13.5,
            max_loan_amount_inr: 5000000,
            min_cibil_score: 680,
            requires_collateral: false,
            active: true,
          },
          {
            id: 5,
            name: "ICICI Bank Education Loan",
            lender_type: "private_bank",
            interest_rate_min: 9.85,
            interest_rate_max: 11.75,
            max_loan_amount_inr: 10000000,
            min_cibil_score: 720,
            requires_collateral: true,
            active: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadLenders();
  }, []);

  const filtered = lenders.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || l.lender_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-[#FEF08A] min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-3 border-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-3 border-black">
          <div>
            <div className="inline-block bg-[#86EFAC] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider -rotate-1 shadow-[2px_2px_0px_#000000] mb-3">
              LIVE UNDERWRITING DIRECTORY
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
              LENDER UNDERWRITING MATRIX
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black/80 mt-2 max-w-2xl">
              Inspect the exact loan limits, interest rate brackets, collateral requirements, and CIBIL benchmarks programmed into Finora&apos;s deterministic rule engine.
            </p>
          </div>

          <Link href="/assessment" className="shrink-0">
            <button className="neo-btn bg-black text-white text-xs sm:text-sm font-black uppercase py-3 px-5 flex items-center gap-2">
              Evaluate Candidate Profile <ArrowRight className="h-4 w-4 stroke-[3]" />
            </button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="neo-box p-4 sm:p-5 bg-[#FFFDF9] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              placeholder="Search by institution name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neo-input text-xs font-bold py-2.5 px-3 bg-white w-full"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                typeFilter === "all"
                  ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              All ({lenders.length})
            </button>
            <button
              onClick={() => setTypeFilter("public_bank")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                typeFilter === "public_bank"
                  ? "bg-[#86EFAC] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              Public Banks
            </button>
            <button
              onClick={() => setTypeFilter("private_bank")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                typeFilter === "private_bank"
                  ? "bg-[#BAE6FD] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              Private Banks
            </button>
            <button
              onClick={() => setTypeFilter("nbfc")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                typeFilter === "nbfc"
                  ? "bg-[#FEF08A] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              NBFCs
            </button>
            <button
              onClick={() => setTypeFilter("international_usd")}
              className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black transition-all ${
                typeFilter === "international_usd"
                  ? "bg-[#FECDD3] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-[#F3F4F6]"
              }`}
            >
              USD Fintech
            </button>
          </div>
        </div>

        {/* Grid of Lenders */}
        {loading ? (
          <div className="neo-box p-12 text-center text-sm font-black uppercase bg-[#FFFDF9]">
            Loading underwriting rules database...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lender) => (
              <div
                key={lender.id}
                className="neo-box p-6 bg-[#FFFDF9] flex flex-col justify-between transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 bg-[#BAE6FD] border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_#000000]">
                      <Building2 className="h-5 w-5 text-black stroke-[2.5]" />
                    </div>
                    <span className="bg-white text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000000]">
                      {lender.lender_type.toUpperCase().replace(/_/g, " ")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-black leading-tight">
                      {lender.name}
                    </h3>
                    <span className="text-xs font-bold text-black/70 mt-1 block">
                      {lender.requires_collateral
                        ? "• Tangible Collateral Mandated"
                        : "• Collateral-Free / Unsecured Option"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-t-2 border-black pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-black/70">Indicative Rate:</span>
                      <span className="font-mono font-black text-black">
                        {lender.interest_rate_min?.toFixed(2)}% - {lender.interest_rate_max?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-black/70">Maximum Limit:</span>
                      <span className="font-mono font-black text-black">
                        {formatCurrency(lender.max_loan_amount_inr)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-black/70">Min CIBIL Score:</span>
                      <span className="font-mono font-bold text-black">
                        {lender.min_cibil_score > 0 ? lender.min_cibil_score : "No CIBIL (USD)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t-2 border-black flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-black flex items-center gap-1 bg-[#86EFAC] px-1.5 py-0.5 border border-black">
                    <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                    Verified Engine
                  </span>
                  <Link
                    href={`/assessment?step=1`}
                    className="text-xs font-black uppercase text-black hover:underline flex items-center gap-1"
                  >
                    Check Match <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
