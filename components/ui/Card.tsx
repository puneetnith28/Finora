"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "interactive" | "flat";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "neo-box bg-[#FFFDF9]",
    elevated: "neo-box bg-white shadow-[6px_6px_0px_#000000]",
    interactive:
      "neo-box bg-[#FFFDF9] hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer",
    flat: "border-2 border-black bg-white p-4",
  };

  return <div ref={ref} className={cn(variants[variant], "p-5 sm:p-6", className)} {...props} />;
});
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-4 border-b-2 border-black/10", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-black uppercase tracking-tight text-black", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs font-bold text-black/70 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("pt-4", className)} {...props} />
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4 border-t-2 border-black/10", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
