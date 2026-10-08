"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: {
    text: string;
    variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  };
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  badge,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
          {value}
        </span>
        {badge && (
          <span
            className={cn(
              "px-2 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wider",
              badge.variant === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800",
              badge.variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800",
              badge.variant === "danger" && "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800",
              (!badge.variant || badge.variant === "default" || badge.variant === "primary") &&
                "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            )}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-normal">
          {subtext}
        </p>
      )}
    </div>
  );
}

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  indicatorClassName?: string;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  indicatorClassName,
  label,
  showPercentage = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-[#0f382c] dark:bg-emerald-500 transition-all duration-300 ease-out rounded-full",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
