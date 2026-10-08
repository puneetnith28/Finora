"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  History, 
  ArrowRight, 
  Calendar, 
  FileText, 
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { FullAssessmentResult } from "@/types";

interface AssessmentHistoryProps {
  studentId: number;
}

export function AssessmentHistory({ studentId }: AssessmentHistoryProps) {
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
      <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        <span>Loading assessment history...</span>
      </div>
    );
  }

  if (error || history.length === 0) {
    return (
      <Card className="p-6 text-center space-y-2 bg-slate-50 dark:bg-slate-900 border-dashed">
        <History className="h-8 w-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Assessment History</h4>
        <p className="text-xs text-slate-500">
          This is the candidate&apos;s initial assessment run. Future evaluations will be recorded here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Assessment Evaluation History ({history.length})
          </h3>
        </div>
        <span className="text-xs text-slate-400">Chronological snapshot log</span>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
        {history.map((item, idx) => {
          const isLatest = idx === 0;
          const score = item.readiness_score || 80;

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                  isLatest ? "border-emerald-600 bg-emerald-500" : "border-slate-400"
                }`}
              />

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Run #{item.id}
                    </span>
                    {isLatest && <Badge variant="success">LATEST ACTIVE</Badge>}
                    <Badge variant="default" className="capitalize">
                      {item.readiness_band}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                    <Link href={`/assessment/${item.id}/report`}>
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                        View Report
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Key Metrics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-200/60 dark:border-slate-700/50">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Readiness Score</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {score.toFixed(0)}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Study Budget</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.total_cost_inr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Funding Gap</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.funding_gap_inr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Co-Borrower FOIR</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatPercent(item.foir_percentage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
