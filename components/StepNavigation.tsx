"use client";

import React from "react";
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
    label: "Candidate Profile",
    shortLabel: "01 / PROFILE",
    description: "Personal & University",
    icon: User,
  },
  {
    id: 2,
    label: "Study Plan & Costs",
    shortLabel: "02 / COSTS",
    description: "Tuition & Currency",
    icon: GraduationCap,
  },
  {
    id: 3,
    label: "Funding Sources",
    shortLabel: "03 / FUNDING",
    description: "Savings & Support",
    icon: DollarSign,
  },
  {
    id: 4,
    label: "Financial Profile",
    shortLabel: "04 / FOIR",
    description: "Income & Debt",
    icon: Wallet,
  },
  {
    id: 5,
    label: "Collateral & Assets",
    shortLabel: "05 / PLEDGE",
    description: "Property & Haircuts",
    icon: Shield,
  },
  {
    id: 6,
    label: "Assessment Review",
    shortLabel: "06 / AUDIT",
    description: "Lender Matching",
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
    <div className="w-full neo-box-lg bg-white p-3 sm:p-4 mb-8">
      <nav aria-label="Assessment Progress">
        <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {WORKFLOW_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = step.id <= maxStepUnlocked && onStepClick;
            const Icon = step.icon;

            const bgClass = isCurrent
              ? "bg-[#FEF08A] shadow-[4px_4px_0px_0px_#000000] translate-x-[-1px] translate-y-[-1px]"
              : isCompleted
              ? "bg-[#86EFAC] shadow-[2px_2px_0px_0px_#000000]"
              : "bg-[#FAF8F5] shadow-[2px_2px_0px_0px_#000000] opacity-80";

            return (
              <li key={step.id} className="relative">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  className={`w-full text-left p-2.5 sm:p-3 border-2 border-black transition-all duration-100 flex flex-col justify-between h-full ${bgClass} ${
                    isClickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="flex h-5 w-5 items-center justify-center border-2 border-black bg-black text-[#FEF08A] font-mono text-[10px] font-black">
                      {isCompleted ? <Check className="h-3 w-3 text-white stroke-[3]" /> : step.id}
                    </span>
                    <Icon className="h-3.5 w-3.5 text-black" />
                  </div>

                  <div>
                    <span className="block text-[11px] font-black tracking-tight uppercase text-black truncate">
                      {step.shortLabel}
                    </span>
                    <span className="block text-[9px] font-bold text-neutral-800 truncate">
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
