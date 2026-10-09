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
      "inline-flex items-center justify-center font-black uppercase tracking-tight border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary: "bg-black text-white hover:bg-neutral-800 shadow-[3px_3px_0px_#000000]",
      secondary: "bg-[#FEF08A] text-black hover:bg-[#FDE047] shadow-[3px_3px_0px_#000000]",
      outline: "bg-white text-black hover:bg-[#F3F4F6] shadow-[3px_3px_0px_#000000]",
      ghost: "bg-transparent border-transparent text-black hover:bg-black/5 active:bg-black/10",
      danger: "bg-[#FECDD3] text-black hover:bg-[#FDA4AF] shadow-[3px_3px_0px_#000000]",
      accent: "bg-[#86EFAC] text-black hover:bg-[#4ADE80] shadow-[3px_3px_0px_#000000]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm px-4 py-2 gap-2",
      lg: "text-sm sm:text-base px-6 py-3 gap-2.5",
      icon: "p-2 justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2 stroke-[3]" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
