"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 transition-all duration-150",
              "border-slate-300 focus:border-[#0f382c] focus:outline-none focus:ring-2 focus:ring-[#0f382c]/10",
              "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20",
              "placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 transition-all duration-150",
            "border-slate-300 focus:border-[#0f382c] focus:outline-none focus:ring-2 focus:ring-[#0f382c]/10",
            "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
