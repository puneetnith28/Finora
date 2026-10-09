"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Compass, Sparkles, X } from "lucide-react";
import { useTour } from "@/lib/context/TourContext";

const emptySubscribe = () => () => {};

export function TourFloatingTrigger() {
  const { startTour, isOpen, hasSeenTour } = useTour();
  const [dismissedPrompt, setDismissedPrompt] = useState(false);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Subtle intro chip rendered only after client mount to prevent hydration mismatch */}
      {isClient && !hasSeenTour && !dismissedPrompt && (
        <div className="neo-box p-2.5 bg-[#FEF08A] max-w-xs flex items-center justify-between gap-2 shadow-[4px_4px_0px_0px_#000000] animate-bounce duration-1000">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-black leading-tight">
            <Sparkles className="h-3.5 w-3.5 text-black shrink-0" />
            <span>New here? Take the 2-min interactive tour</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDismissedPrompt(true);
            }}
            className="p-0.5 hover:bg-black/10 rounded-none text-black"
            aria-label="Dismiss tour tip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating launcher button */}
      <button
        type="button"
        onClick={() => startTour(0)}
        className="neo-btn bg-black text-white hover:bg-neutral-800 p-2.5 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_0px_#FEF08A] border-2 border-black group"
        aria-label="Launch interactive product tour"
      >
        <div className="w-5 h-5 bg-[#FEF08A] text-black flex items-center justify-center border border-black group-hover:rotate-12 transition-transform">
          <Compass className="h-3.5 w-3.5 stroke-[2.5]" />
        </div>
        <span className="hidden sm:inline">Product Tour</span>
      </button>
    </div>
  );
}
