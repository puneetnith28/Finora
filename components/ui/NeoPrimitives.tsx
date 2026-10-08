"use client";

import React from "react";

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "yellow" | "black" | "pink" | "cyan" | "mint" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export function NeoButton({
  variant = "yellow",
  size = "md",
  className = "",
  children,
  ...props
}: NeoButtonProps) {
  const variantClasses = {
    primary: "neo-btn-primary",
    yellow: "neo-btn-primary",
    black: "neo-btn-black",
    pink: "neo-btn-pink",
    cyan: "neo-btn-cyan",
    mint: "neo-btn-mint",
    white: "bg-white hover:bg-neutral-50 text-black",
  }[variant];

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-[11px]",
    md: "px-4 py-2.5 text-xs",
    lg: "px-6 py-3.5 text-sm",
  }[size];

  return (
    <button
      className={`neo-btn ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface NeoBadgeProps {
  children: React.ReactNode;
  variant?: "yellow" | "cyan" | "mint" | "pink" | "white" | "black";
  rotate?: "left" | "right" | "none";
  className?: string;
}

export function NeoBadge({
  children,
  variant = "yellow",
  rotate = "none",
  className = "",
}: NeoBadgeProps) {
  const variantClasses = {
    yellow: "neo-pill-yellow",
    cyan: "neo-pill-cyan",
    mint: "neo-pill-mint",
    pink: "neo-pill-pink",
    white: "neo-pill-white",
    black: "neo-pill-black",
  }[variant];

  const rotateClasses = {
    left: "-rotate-2",
    right: "rotate-2",
    none: "",
  }[rotate];

  return (
    <span
      className={`neo-pill ${variantClasses} ${rotateClasses} ${className}`}
    >
      {children}
    </span>
  );
}

interface NeoCardProps {
  children: React.ReactNode;
  variant?: "white" | "yellow" | "cyan" | "mint" | "pink" | "black";
  interactive?: boolean;
  className?: string;
}

export function NeoCard({
  children,
  variant = "white",
  interactive = false,
  className = "",
}: NeoCardProps) {
  const variantClasses = {
    white: "bg-white",
    yellow: "bg-[#FEF08A]",
    cyan: "bg-[#BAE6FD]",
    mint: "bg-[#86EFAC]",
    pink: "bg-[#F472B6]",
    black: "bg-[#000000] text-white shadow-[5px_5px_0px_0px_#FDE047]",
  }[variant];

  const baseClass = interactive ? "neo-box-interactive" : "neo-box";

  return (
    <div className={`${baseClass} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}

interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  badge?: string;
  className?: string;
}

export function NeoInput({
  label,
  error,
  badge,
  className = "",
  id,
  ...props
}: NeoInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5"
          >
            {label}
          </label>
          {badge && <NeoBadge variant="cyan">{badge}</NeoBadge>}
        </div>
      )}
      <input
        id={inputId}
        className={`neo-input ${error ? "border-red-600 bg-red-50" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[11px] font-black uppercase text-red-600 bg-red-100 border-2 border-red-600 px-2 py-1 shadow-[2px_2px_0px_0px_#DC2626]">
          {error}
        </p>
      )}
    </div>
  );
}

export function NeoDivider({ className = "" }: { className?: string }) {
  return <div className={`border-b-2 border-black my-4 ${className}`} />;
}
