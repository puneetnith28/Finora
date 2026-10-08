"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, User, GraduationCap, DollarSign, Wallet, Shield, ClipboardCheck } from "lucide-react";

export interface StepItem {
  id: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_STEPS: StepItem[] = [
  {
    id: 1,
    label: "Student Profile",
    shortLabel: "Profile",
    description: "Personal and academic target",
    icon: User,
  },
  {
    id: 2,
    label: "Study Plan & Costs",
    shortLabel: "Study Costs",
    description: "Tuition, living and currency",
    icon: GraduationCap,
  },
  {
    id: 3,
    label: "Funding Sources",
    shortLabel: "Funding",
    description: "Savings, scholarship & support",
    icon: DollarSign,
  },
  {
    id: 4,
    label: "Financial Profile",
    shortLabel: "Financials",
    description: "Income, debt & FOIR",
    icon: Wallet,
  },
  {
    id: 5,
    label: "Collateral & Assets",
    shortLabel: "Collateral",
    description: "Pledged property & LTV",
    icon: Shield,
  },
  {
    id: 6,
    label: "Review & Assessment",
    shortLabel: "Assessment",
    description: "Rule audit & lender matching",
    icon: ClipboardCheck,
  },
];

export interface StepNavigationProps {
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  maxStepUnlocked?: number;
}

export function StepNavigation({
  currentStep,
  onStepClick,
  maxStepUnlocked = 6,
}: StepNavigationProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-8">
      <nav aria-label="Assessment Progress">
        <ol className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {WORKFLOW_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id <= maxStepUnlocked && onStepClick;
            const Icon = step.icon;

            return (
              <li key={step.id} className="relative">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all duration-150 flex flex-col justify-between h-full",
                    isCurrent
                      ? "bg-[#0f382c] text-white shadow-md dark:bg-emerald-600 dark:text-slate-950"
                      : isCompleted
                      ? "bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300"
                      : "bg-slate-50/60 border border-slate-200/60 text-slate-500 dark:bg-slate-950/40 dark:border-slate-800/60 dark:text-slate-400",
                    isClickable && !isCurrent && "cursor-pointer hover:border-slate-300 dark:hover:border-slate-700",
                    !isClickable && "cursor-default opacity-80"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        isCurrent
                          ? "bg-white/20 text-white dark:bg-slate-950/30 dark:text-slate-950"
                          : isCompleted
                          ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
                    </span>
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isCurrent
                          ? "text-emerald-300 dark:text-slate-950/70"
                          : isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400"
                      )}
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold tracking-tight truncate">
                      {step.shortLabel}
                    </span>
                    <span
                      className={cn(
                        "block text-[10px] truncate",
                        isCurrent
                          ? "text-emerald-100 dark:text-slate-900"
                          : "text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {step.description}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
