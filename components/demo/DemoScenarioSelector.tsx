"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowUpRight, 
  Loader2, 
  Check, 
  Sparkles
} from "lucide-react";
import { NeoBadge, NeoButton, NeoCard } from "@/components/ui/NeoPrimitives";
import { api } from "@/lib/api";
import { CANONICAL_DEMO_PERSONAS } from "@/lib/constants/demo";

export const SAMPLE_PERSONAS = CANONICAL_DEMO_PERSONAS;

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
      router.push("/assessment");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="neo-box-lg bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <NeoBadge variant="pink" rotate="left">
              REVIEWER EVALUATION CASES
            </NeoBadge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
            CALIBRATED CANDIDATE PERSONAS
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-700">
            Click any persona to seed the deterministic scenario and inspect the live audit trail.
          </p>
        </div>

        <NeoButton
          variant="primary"
          onClick={handleSeedAll}
          disabled={isSeeding}
          className="shrink-0"
        >
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>SEEDING RECORDS...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>SEED ALL 5 DEMO SCENARIOS</span>
            </>
          )}
        </NeoButton>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_PERSONAS.map((p) => (
          <div
            key={p.id}
            onClick={handleSeedAll}
            className="neo-box-interactive p-4 bg-white flex flex-col justify-between space-y-3 cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs border-2 border-black bg-black text-[#FEF08A] px-1.5 py-0.5">
                    {p.num}
                  </span>
                  <span className="font-black text-sm text-black">{p.name}</span>
                </div>
                <NeoBadge variant={p.badgeColor}>{p.tag}</NeoBadge>
              </div>

              <div className="text-xs font-black text-black">
                {p.university}
              </div>
              <p className="text-[11px] font-bold text-neutral-600 mt-1">
                {p.profile}
              </p>
            </div>

            <div className="pt-2 border-t-2 border-black flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-black tracking-tight truncate pr-2">
                {p.verdict}
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        ))}
      </div>

      {seededCount && (
        <div className="flex items-center gap-2 text-xs font-black bg-[#86EFAC] border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000000]">
          <Check className="h-4 w-4" />
          <span>{seededCount} DEMO CANDIDATE SCENARIOS RECORDED IN DATABASE.</span>
        </div>
      )}
    </div>
  );
}
