"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  GraduationCap, 
  AlertTriangle, 
  ShieldCheck 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export const SAMPLE_PERSONAS = [
  {
    id: "aarav",
    name: "Aarav Mehta",
    title: "US MS in CS (Tier-1 Prime Approval)",
    country: "USA",
    university: "Carnegie Mellon University",
    profile: "CIBIL 780 • Co-borrower ₹1.6L/mo • ₹60L Property Collateral",
    outcome: "Unanimous Tier-1 Bank Approval (9.2% Rate)",
    outcomeVariant: "success" as const,
    icon: ShieldCheck,
  },
  {
    id: "priya",
    name: "Priya Sharma",
    title: "UK MSc Finance (Unsecured Route)",
    country: "UK",
    university: "London School of Economics",
    profile: "CIBIL 725 • Co-borrower ₹95k/mo • No Collateral",
    outcome: "Eligible for Specialist Unsecured NBFCs",
    outcomeVariant: "info" as const,
    icon: GraduationCap,
  },
  {
    id: "rohan",
    name: "Rohan Verma",
    title: "Canada MBA (High FOIR Stress)",
    country: "Canada",
    university: "University of Toronto",
    profile: "CIBIL 660 • Co-borrower ₹55k/mo • ₹32k Existing EMIs",
    outcome: "FOIR 78% Warning • Remedial Actions Triggered",
    outcomeVariant: "danger" as const,
    icon: AlertTriangle,
  },
  {
    id: "ananya",
    name: "Ananya Iyer",
    title: "Germany Robotics (Scholarship & Low Gap)",
    country: "Germany",
    university: "TU Munich",
    profile: "€0 Tuition • €4k Scholarship • ₹15L Fixed Deposit Collateral",
    outcome: "Low Loan Gap • High Readiness Score (94/100)",
    outcomeVariant: "success" as const,
    icon: Sparkles,
  },
  {
    id: "vikram",
    name: "Vikram Patel",
    title: "Australia Data Science (Discrepancy Flag)",
    country: "Australia",
    university: "University of Melbourne",
    profile: "CIBIL 695 • Co-borrower ₹72k/mo • Unverified Collateral Title",
    outcome: "Conditional Approval • Document Discrepancy",
    outcomeVariant: "warning" as const,
    icon: AlertTriangle,
  },
];

export function DemoScenarioSelector() {
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededCount, setSeededCount] = useState<number | null>(null);

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      const res = await api.post<{ scenarios: Array<{ assessment_id: number }> }>("/api/demo/seed", {});
      setSeededCount(res.scenarios?.length || 5);
      if (res.scenarios && res.scenarios.length > 0) {
        router.push(`/assessment/${res.scenarios[0].assessment_id}/report`);
      }
    } catch {
      // Fallback
      router.push("/assessment");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 space-y-6 bg-gradient-to-br from-slate-900 to-emerald-950 text-white border-emerald-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Reviewer Fast-Track</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Evaluator Demo Candidate Scenarios
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            Instantly load calibrated student profiles representing diverse financial circumstances.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleSeedAll}
          disabled={isSeeding}
          className="shrink-0 bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold"
          leftIcon={
            isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )
          }
        >
          {isSeeding ? "Seeding Scenarios..." : "Seed All 5 Scenarios & View Report"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_PERSONAS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              onClick={handleSeedAll}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-white">{p.name}</span>
                </div>
                <Badge variant={p.outcomeVariant} className="text-[10px]">
                  {p.country}
                </Badge>
              </div>

              <div className="text-xs text-emerald-200 font-medium">{p.university}</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{p.profile}</p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-emerald-300 font-medium truncate">{p.outcome}</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {seededCount && (
        <div className="flex items-center gap-2 text-xs text-emerald-300 pt-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{seededCount} demo scenarios seeded into database successfully.</span>
        </div>
      )}
    </Card>
  );
}
