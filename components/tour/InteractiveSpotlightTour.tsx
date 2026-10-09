"use client";

import React, { useRef, useEffect } from "react";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Compass, 
  Loader2,
  MapPin,
  Sparkles
} from "lucide-react";
import { useTour } from "@/lib/context/TourContext";

function subscribeToWindow(callback: () => void) {
  window.addEventListener("resize", callback);
  window.addEventListener("scroll", callback, { passive: true });
  return () => {
    window.removeEventListener("resize", callback);
    window.removeEventListener("scroll", callback);
  };
}

function getWindowSnapshot() {
  return typeof window === "undefined" ? "0x0" : `${window.innerWidth}x${window.innerHeight}`;
}

function getWindowServerSnapshot() {
  return "1280x800";
}

export function InteractiveSpotlightTour() {
  const {
    isOpen,
    currentStepIndex,
    currentStep,
    totalSteps,
    isNavigating,
    targetRect,
    nextStep,
    prevStep,
    goToStep,
    closeTour,
    finishTour,
  } = useTour();

  const popoverRef = useRef<HTMLDivElement>(null);
  const windowDims = React.useSyncExternalStore(
    subscribeToWindow,
    getWindowSnapshot,
    getWindowServerSnapshot
  );

  const [vw, vh] = windowDims.split("x").map(Number);
  const viewportWidth = vw || 1280;
  const viewportHeight = vh || 800;
  const isMobile = viewportWidth < 768;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Add Enter key listener to advance tour easily
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (isLastStep) {
          finishTour();
        } else {
          nextStep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLastStep, nextStep, finishTour]);

  // Derive high-precision positioning synchronously so footer is ALWAYS visible
  const popoverStyle = React.useMemo<React.CSSProperties>(() => {
    if (typeof window === "undefined") {
      return { position: "fixed", zIndex: 9999 };
    }

    // 1. Mobile Layout: dock cleanly to top or bottom based on target position
    if (isMobile) {
      if (!targetRect) {
        return {
          position: "fixed",
          bottom: "16px",
          left: "12px",
          right: "12px",
          maxHeight: `${Math.min(480, viewportHeight - 32)}px`,
          zIndex: 9999,
        };
      }

      // If target element is in lower half of the screen, dock card at top so element is visible
      const targetCenterY = targetRect.top + targetRect.height / 2;
      if (targetCenterY > viewportHeight * 0.45) {
        return {
          position: "fixed",
          top: "16px",
          left: "12px",
          right: "12px",
          maxHeight: `${Math.min(480, viewportHeight - 32)}px`,
          zIndex: 9999,
        };
      } else {
        return {
          position: "fixed",
          bottom: "16px",
          left: "12px",
          right: "12px",
          maxHeight: `${Math.min(480, viewportHeight - 32)}px`,
          zIndex: 9999,
        };
      }
    }

    // 2. Desktop Layout
    const popoverWidth = Math.min(470, viewportWidth - 40);
    const maxAllowedHeight = Math.min(520, viewportHeight - 32);
    const margin = 20;

    if (!targetRect) {
      // Centered fallback
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${popoverWidth}px`,
        maxHeight: `${maxAllowedHeight}px`,
        zIndex: 9999,
      };
    }

    const spaceBelow = viewportHeight - targetRect.bottom - margin;
    const spaceAbove = targetRect.top - margin;
    const targetCenterX = targetRect.left + targetRect.width / 2;

    const isExtraTall = targetRect.height > viewportHeight * 0.55;
    const isExtraWide = targetRect.width > viewportWidth * 0.70;

    // For large containers (e.g. Receipt box, 6-step form, Lender matrix), dock safely to bottom-right
    if (isExtraTall || isExtraWide) {
      return {
        position: "fixed",
        bottom: `${margin}px`,
        right: `${margin}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${maxAllowedHeight}px`,
        zIndex: 9999,
      };
    }

    // For standard elements, check preferred placement
    const preferredPlacement = currentStep.placement || "bottom";

    if (preferredPlacement === "bottom" && spaceBelow >= 360) {
      const left = Math.max(margin, Math.min(targetCenterX - popoverWidth / 2, viewportWidth - popoverWidth - margin));
      return {
        position: "fixed",
        top: `${Math.round(targetRect.bottom + 12)}px`,
        left: `${Math.round(left)}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${Math.min(maxAllowedHeight, spaceBelow - 12)}px`,
        zIndex: 9999,
      };
    }

    if (preferredPlacement === "top" && spaceAbove >= 360) {
      const left = Math.max(margin, Math.min(targetCenterX - popoverWidth / 2, viewportWidth - popoverWidth - margin));
      return {
        position: "fixed",
        bottom: `${Math.round(viewportHeight - targetRect.top + 12)}px`,
        left: `${Math.round(left)}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${Math.min(maxAllowedHeight, spaceAbove - 12)}px`,
        zIndex: 9999,
      };
    }

    // Fallback: place below if room, else above, else bottom-right corner
    if (spaceBelow >= 360) {
      const left = Math.max(margin, Math.min(targetCenterX - popoverWidth / 2, viewportWidth - popoverWidth - margin));
      return {
        position: "fixed",
        top: `${Math.round(targetRect.bottom + 12)}px`,
        left: `${Math.round(left)}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${Math.min(maxAllowedHeight, spaceBelow - 12)}px`,
        zIndex: 9999,
      };
    }

    if (spaceAbove >= 360) {
      const left = Math.max(margin, Math.min(targetCenterX - popoverWidth / 2, viewportWidth - popoverWidth - margin));
      return {
        position: "fixed",
        bottom: `${Math.round(viewportHeight - targetRect.top + 12)}px`,
        left: `${Math.round(left)}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${Math.min(maxAllowedHeight, spaceAbove - 12)}px`,
        zIndex: 9999,
      };
    }

    // Default safe floating HUD docked to bottom-right
    return {
      position: "fixed",
      bottom: `${margin}px`,
      right: `${margin}px`,
      width: `${popoverWidth}px`,
      maxHeight: `${maxAllowedHeight}px`,
      zIndex: 9999,
    };
  }, [targetRect, currentStep, viewportWidth, viewportHeight, isMobile]);

  if (!isOpen) return null;

  const bgVariantClass = {
    yellow: "bg-[#FEF08A]",
    cyan: "bg-[#BAE6FD]",
    mint: "bg-[#86EFAC]",
    pink: "bg-[#F472B6]",
    white: "bg-[#FFFDF9]",
    black: "bg-black text-white",
  }[currentStep.accentColor];

  const paddingBox = 10;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-auto select-none">
      {/* 1. Dark Backdrop Overlay with Smooth Spotlight Cutout */}
      {targetRect ? (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9991]">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={Math.max(0, targetRect.left - paddingBox)}
                y={Math.max(0, targetRect.top - paddingBox)}
                width={Math.max(0, targetRect.width + paddingBox * 2)}
                height={Math.max(0, targetRect.height + paddingBox * 2)}
                rx="8"
                fill="black"
                style={{
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.65)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-[1px] z-[9991] transition-opacity duration-300" />
      )}

      {/* 2. Spotlight Animated Target Frame & Corner Beacons */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - paddingBox,
            left: targetRect.left - paddingBox,
            width: targetRect.width + paddingBox * 2,
            height: targetRect.height + paddingBox * 2,
            zIndex: 9992,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="pointer-events-none border-3 border-black shadow-[0_0_0_4px_#FEF08A] rounded-sm"
        >
          {/* 4 Corner Neo-Brutalist Beacons */}
          <span className="absolute -top-2 -left-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
          <span className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
          <span className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
        </div>
      )}

      {/* 3. Anchored Guided Popover Card with Smooth Viewport Tracking */}
      <div
        ref={popoverRef}
        style={{
          ...popoverStyle,
          transition: "top 0.4s cubic-bezier(0.16, 1, 0.3, 1), left 0.4s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1), right 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s ease-out, max-height 0.3s ease-out, opacity 0.25s ease-out",
        }}
        className="neo-box-lg bg-[#FFFDF9] flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_#000000] z-[9999]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
      >
        {/* Header Ribbon (flex-shrink: 0) */}
        <div className={`shrink-0 p-3 sm:p-3.5 border-b-3 border-black flex items-center justify-between ${bgVariantClass} transition-colors duration-200`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black text-white flex items-center justify-center border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] shrink-0">
              <Compass className="h-3.5 w-3.5 text-[#FEF08A]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black">
                {currentStep.tag}
              </span>
              <span className="text-xs font-mono font-black text-black">
                STEP {currentStepIndex + 1} OF {totalSteps}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Current Route Indicator Badge */}
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold bg-white text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
              <MapPin className="h-3 w-3" />
              {currentStep.route}
            </span>

            <button
              type="button"
              onClick={closeTour}
              className="w-7 h-7 bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-100 transition-transform active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Close product tour"
            >
              <X className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar (flex-shrink: 0) */}
        <div className="shrink-0 w-full bg-neutral-200 h-1.5 border-b-2 border-black flex overflow-hidden">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 border-r border-black last:border-r-0 transition-all duration-200 ${
                idx <= currentStepIndex ? "bg-black" : "bg-neutral-100"
              }`}
            />
          ))}
        </div>

        {/* Content Body (flex-1 min-h-0 overflow-y-auto so header & footer never get pushed off) */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 min-h-0 text-left">
          {isNavigating ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-black" />
              <span className="text-xs font-black uppercase text-black">
                Navigating to {currentStep.route}...
              </span>
            </div>
          ) : (
            <div key={currentStep.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2.5">
              {/* Title & Subtitle */}
              <div>
                <h2 
                  id="tour-step-title"
                  className="text-base sm:text-lg font-black uppercase tracking-tight text-black leading-tight"
                >
                  {currentStep.title}
                </h2>
                <p className="text-[11px] sm:text-xs font-bold text-neutral-800 mt-0.5">
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Description Box */}
              <p className="text-xs font-medium text-neutral-900 leading-relaxed bg-[#FFFBEB] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {currentStep.description}
              </p>

              {/* Key Takeaways */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-black block">
                  Key Highlights:
                </span>
                <ul className="space-y-1">
                  {currentStep.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] sm:text-xs font-bold text-black">
                      <span className="w-3.5 h-3.5 bg-[#86EFAC] border border-black flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_#000]">
                        <CheckCircle2 className="h-2.5 w-2.5 text-black stroke-[3]" />
                      </span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Tip Pill */}
              {currentStep.actionTip && (
                <div className="p-2 bg-[#E0F2FE] border border-black text-[11px] font-bold text-black flex items-center gap-1.5 shadow-[1px_1px_0px_#000]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-700" />
                  <span>{currentStep.actionTip}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar (flex-shrink: 0, ALWAYS 100% VISIBLE) */}
        <div className="shrink-0 p-3 sm:p-3.5 bg-white border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToStep(idx)}
                className={`w-2.5 h-2.5 border border-black transition-all ${
                  idx === currentStepIndex
                    ? "bg-black scale-125 shadow-[1px_1px_0px_#000]"
                    : "bg-white hover:bg-neutral-200"
                }`}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
            <span className="text-[10px] font-mono font-bold text-neutral-500 ml-2 hidden sm:inline">
              [← / → / Enter]
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {!isFirstStep ? (
              <button
                type="button"
                onClick={prevStep}
                className="neo-btn bg-white hover:bg-neutral-100 text-black py-1.5 px-3 text-xs flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3 stroke-[3]" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={closeTour}
                className="text-xs font-black uppercase text-neutral-600 hover:text-black py-1 px-2 underline decoration-black underline-offset-4"
              >
                Skip Tour
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={finishTour}
                className="neo-btn bg-[#86EFAC] hover:bg-[#4ADE80] text-black py-2 px-4 text-xs font-black uppercase flex items-center gap-1 shadow-[3px_3px_0px_0px_#000]"
              >
                <span>Finish Tour 🎉</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="neo-btn bg-black text-white py-2 px-4 text-xs font-black uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#FEF08A] hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="h-3 w-3 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

