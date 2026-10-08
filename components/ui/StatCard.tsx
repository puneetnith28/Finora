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
        "relative p-4 sm:p-5 bg-[#FFFDF9] border-2 border-black shadow-[3px_3px_0px_#000000] overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black/60">
          {label}
        </span>
        {icon && <div className="text-black">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-xl sm:text-2xl font-black tracking-tight text-black font-mono">
          {value}
        </span>
        {badge && (
          <span
            className={cn(
              "px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-black",
              badge.variant === "success" && "bg-[#86EFAC] text-black shadow-[1px_1px_0px_#000000]",
              badge.variant === "warning" && "bg-[#FEF08A] text-black shadow-[1px_1px_0px_#000000]",
              badge.variant === "danger" && "bg-[#FECDD3] text-black shadow-[1px_1px_0px_#000000]",
              (!badge.variant || badge.variant === "default" || badge.variant === "primary") &&
                "bg-[#BAE6FD] text-black shadow-[1px_1px_0px_#000000]"
            )}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] font-bold text-black/70 mt-1.5 line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
