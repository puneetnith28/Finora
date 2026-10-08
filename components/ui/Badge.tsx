"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    primary: "finora-badge-primary",
    success: "finora-badge-success",
    warning: "finora-badge-warning",
    danger: "finora-badge-danger",
    info: "finora-badge-info",
    outline: "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
