"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "elevated" | "interactive" | "flat" }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "finora-card",
    elevated: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg",
    interactive: "finora-card-interactive",
    flat: "bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl",
  };

  return (
    <div
      ref={ref}
      className={cn(variants[variant], "p-6", className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-slate-100 dark:border-slate-800/60", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
