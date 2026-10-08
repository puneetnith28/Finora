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
    default: "bg-[#E5E7EB] text-black border-2 border-black shadow-[1px_1px_0px_#000000]",
    primary: "bg-black text-white border-2 border-black shadow-[1px_1px_0px_#000000]",
    success: "bg-[#86EFAC] text-black border-2 border-black shadow-[1px_1px_0px_#000000]",
    warning: "bg-[#FEF08A] text-black border-2 border-black shadow-[1px_1px_0px_#000000]",
    danger: "bg-[#FECDD3] text-black border-2 border-black shadow-[1px_1px_0px_#000000]",
    info: "bg-[#BAE6FD] text-black border-2 border-black shadow-[1px_1px_0px_#000000]",
    outline: "bg-white text-black border-2 border-black shadow-[1px_1px_0px_#000000]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
    md: "px-2.5 py-1 text-xs font-black uppercase tracking-wider",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-black uppercase select-none",
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
