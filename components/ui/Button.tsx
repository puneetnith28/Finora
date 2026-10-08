"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const variants = {
      primary:
        "bg-[#0f382c] text-white hover:bg-[#164e3f] active:bg-[#0b2b22] shadow-sm hover:shadow dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      outline:
        "border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60",
      ghost:
        "text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800/60",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm",
      accent:
        "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5 font-semibold",
      md: "text-sm px-4 py-2.25 rounded-xl gap-2 font-medium",
      lg: "text-base px-6 py-3 rounded-xl gap-2.5 font-semibold",
      icon: "p-2.25 rounded-xl justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
