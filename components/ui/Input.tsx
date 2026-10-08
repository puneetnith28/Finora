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
            className="block text-xs font-black uppercase tracking-wider text-black"
          >
            {label}
            {props.required && <span className="text-[#E11D48] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-black">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full border-2 border-black bg-white px-3 py-2 text-xs sm:text-sm font-bold text-black transition-all",
              "focus:outline-none focus:ring-2 focus:ring-black focus:border-black shadow-[2px_2px_0px_#000000]",
              "placeholder:text-black/40 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-[#E11D48] bg-[#FFF1F2]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-black">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#E11D48] font-bold">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-black/60 font-medium">{helperText}</p>
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
            className="block text-xs font-black uppercase tracking-wider text-black"
          >
            {label}
            {props.required && <span className="text-[#E11D48] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "flex h-11 w-full border-2 border-black bg-white px-3 py-2 text-xs sm:text-sm font-bold text-black transition-all",
            "focus:outline-none focus:ring-2 focus:ring-black focus:border-black shadow-[2px_2px_0px_#000000] cursor-pointer",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#E11D48] bg-[#FFF1F2]",
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
        {error && <p className="text-xs text-[#E11D48] font-bold">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-black/60 font-medium">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
