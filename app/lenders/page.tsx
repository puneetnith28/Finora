"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
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
        // Fallback demo lenders if backend is initializing
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Underwriting Database</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Lender Underwriting Matrix & Rulesets
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            Explore the exact eligibility limits, interest rate brackets, collateral mandates, 
            and CIBIL requirements configured across all participating lenders.
          </p>
        </div>

        <Link href="/assessment">
          <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Evaluate Your Profile
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by bank or NBFC name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold self-stretch sm:self-auto">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-2 rounded-lg transition-all ${
              typeFilter === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            All Lenders
          </button>
          <button
            onClick={() => setTypeFilter("public_bank")}
            className={`px-3 py-2 rounded-lg transition-all ${
              typeFilter === "public_bank"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Public Banks
          </button>
          <button
            onClick={() => setTypeFilter("private_bank")}
            className={`px-3 py-2 rounded-lg transition-all ${
              typeFilter === "private_bank"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Private Banks
          </button>
          <button
            onClick={() => setTypeFilter("nbfc")}
            className={`px-3 py-2 rounded-lg transition-all ${
              typeFilter === "nbfc"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            NBFCs
          </button>
          <button
            onClick={() => setTypeFilter("international_usd")}
            className={`px-3 py-2 rounded-lg transition-all ${
              typeFilter === "international_usd"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            USD Fintech
          </button>
        </div>
      </div>

      {/* Grid of Lenders */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading lender directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lender) => (
            <Card key={lender.id} className="flex flex-col justify-between hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#0f382c]/10 text-[#0f382c] dark:bg-emerald-950 dark:text-emerald-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">
                    {lender.lender_type.toUpperCase().replace("_", " ")}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    {lender.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {lender.requires_collateral
                      ? "Tangible Collateral Required"
                      : "Unsecured / Collateral-Free Option Available"}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interest Rates:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {lender.interest_rate_min?.toFixed(2)}% - {lender.interest_rate_max?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Sanction:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(lender.max_loan_amount_inr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Min CIBIL Score:</span>
                    <span className="font-mono font-semibold">
                      {lender.min_cibil_score > 0 ? lender.min_cibil_score : "No CIBIL Mandate (USD)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active in Engine
                </span>
                <Link href={`/assessment?step=1`} className="text-xs font-bold text-[#0f382c] dark:text-emerald-400 hover:underline">
                  Check Match →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
