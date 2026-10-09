"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, ArrowRight, Calendar, FileText, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { FullAssessmentResult } from "@/types";
import { useStudent } from "@/lib/context/StudentContext";

interface AssessmentHistoryProps {
  studentId?: number;
}

export function AssessmentHistory({ studentId: propStudentId }: AssessmentHistoryProps) {
  const { activeStudentId } = useStudent();
  const studentId = propStudentId || activeStudentId || 1;

  const [history, setHistory] = useState<FullAssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<FullAssessmentResult[]>(
          `/api/students/${studentId}/assessments`
        );
        setHistory(data || []);
      } catch {
        setError("Unable to load previous assessment history.");
      } finally {
        setIsLoading(false);
      }
    }

    if (studentId) {
      loadHistory();
    }
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm font-bold text-black neo-box bg-[#FFFDF9]">
        <Loader2 className="h-4 w-4 animate-spin text-black" />
        <span>Loading assessment chronological history...</span>
      </div>
    );
  }

  if (error || history.length === 0) {
    return (
      <div className="neo-box p-6 text-center space-y-2 bg-[#FFFDF9]">
        <History className="h-8 w-8 text-black mx-auto stroke-[2.5]" />
        <h4 className="text-sm font-black uppercase tracking-tight text-black">
          Initial Assessment Run
        </h4>
        <p className="text-xs font-bold text-black/70">
          This is the candidate&apos;s initial assessment run. Future evaluations will be recorded
          in this audit timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="neo-box p-6 sm:p-8 space-y-6 bg-[#FFFDF9]">
      <div className="flex items-center justify-between pb-4 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-black stroke-[2.5]" />
          <h3 className="text-xl font-black uppercase tracking-tight text-black">
            Evaluation Timeline ({history.length})
          </h3>
        </div>
        <span className="text-xs font-mono font-bold bg-[#FEF08A] px-2 py-0.5 border border-black">
          Chronological Audit Log
        </span>
      </div>

      <div className="relative pl-6 border-l-3 border-black space-y-6">
        {history.map((item, idx) => {
          const isLatest = idx === 0;
          const score = item.readiness_score || 80;

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[31px] top-2 w-4 h-4 border-2 border-black ${
                  isLatest ? "bg-[#86EFAC]" : "bg-white"
                }`}
              />

              <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-[#FFFDF9]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-black uppercase text-black flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-black stroke-[2.5]" />
                      Run #{item.id}
                    </span>
                    {isLatest && (
                      <span className="bg-[#86EFAC] text-black border border-black px-2 py-0.5 text-[10px] font-black uppercase">
                        Active Run
                      </span>
                    )}
                    <span className="bg-[#BAE6FD] text-black border border-black px-2 py-0.5 text-[10px] font-black uppercase">
                      {item.readiness_band}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-black">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                    <Link href={`/assessment/${item.id}/report`}>
                      <button className="neo-btn bg-[#FEF08A] text-black text-[11px] font-black uppercase py-1 px-2.5 flex items-center gap-1">
                        View Dossier <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Key Metrics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-black/20">
                  <div>
                    <span className="text-black/60 block text-[9px] font-black uppercase tracking-wider">
                      Score
                    </span>
                    <span className="font-mono font-black text-black text-sm">
                      {score.toFixed(0)}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-black/60 block text-[9px] font-black uppercase tracking-wider">
                      Budget
                    </span>
                    <span className="font-mono font-bold text-black">
                      {formatCurrency(item.total_cost_inr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-black/60 block text-[9px] font-black uppercase tracking-wider">
                      Gap
                    </span>
                    <span className="font-mono font-bold text-black">
                      {formatCurrency(item.funding_gap_inr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-black/60 block text-[9px] font-black uppercase tracking-wider">
                      FOIR
                    </span>
                    <span className="font-mono font-bold text-black">
                      {formatPercent(item.foir_percentage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
