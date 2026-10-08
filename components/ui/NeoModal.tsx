"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { NeoBadge, NeoButton } from "./NeoPrimitives";

interface NeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function NeoModal({
  isOpen,
  onClose,
  title,
  badge = "ACTION REQUIRED",
  children,
  footer,
  maxWidth = "md",
}: NeoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
      <div
        className={`w-full ${widthClass} neo-box-lg bg-white p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 relative`}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <NeoBadge variant="pink">{badge}</NeoBadge>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-black">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black p-1 bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-xs font-bold text-neutral-900 leading-relaxed max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="pt-3 border-t-2 border-black flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
