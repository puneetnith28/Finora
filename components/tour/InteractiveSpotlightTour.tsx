"use client";

import React, { useEffect, useState, useRef } from "react";
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

  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [arrowPosition, setArrowPosition] = useState<"top" | "bottom" | "none">("none");
  const popoverRef = useRef<HTMLDivElement>(null);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Calculate popover positioning relative to target element
  useEffect(() => {
    if (!isOpen) return;

    const calculatePosition = () => {
      if (!targetRect || typeof window === "undefined") {
        // Center fallback
        setPopoverStyle({
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "38rem",
          width: "92vw",
          zIndex: 9999,
        });
        setArrowPosition("none");
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popoverWidth = Math.min(560, viewportWidth - 32);
      const isMobile = viewportWidth < 768;

      if (isMobile) {
        // On mobile, dock cleanly at bottom of viewport to leave element visible
        setPopoverStyle({
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100vw - 32px)",
          maxWidth: "480px",
          maxHeight: "65vh",
          zIndex: 9999,
        });
        setArrowPosition("none");
        return;
      }

      const spaceBelow = viewportHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;

      let top: number;
      let left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);

      // Clamp horizontal within screen margins
      left = Math.max(16, Math.min(left, viewportWidth - popoverWidth - 16));

      if (spaceBelow >= 320 || spaceBelow >= spaceAbove) {
        // Place below element
        top = targetRect.bottom + 16;
        setArrowPosition("top");
      } else {
        // Place above element
        top = Math.max(16, targetRect.top - 360);
        setArrowPosition("bottom");
      }

      setPopoverStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        maxHeight: "85vh",
        zIndex: 9999,
      });
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [isOpen, targetRect, currentStepIndex]);

  if (!isOpen) return null;

  const bgVariantClass = {
    yellow: "bg-[#FEF08A]",
    cyan: "bg-[#BAE6FD]",
    mint: "bg-[#86EFAC]",
    pink: "bg-[#F472B6]",
    white: "bg-[#FFFDF9]",
    black: "bg-black text-white",
  }[currentStep.accentColor];

  const paddingBox = 8;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-auto select-none">
      {/* 1. Dark Backdrop Overlay with Spotlight Cutout */}
      {targetRect ? (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9991]">
          <defs>
            <mask id="spotlight-mask">
              {/* White background enables mask */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout punches hole around targetRect */}
              <rect
                x={targetRect.left - paddingBox}
                y={targetRect.top - paddingBox}
                width={targetRect.width + paddingBox * 2}
                height={targetRect.height + paddingBox * 2}
                rx="6"
                fill="black"
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
        <div className="fixed inset-0 bg-black/65 backdrop-blur-[1px] z-[9991]" />
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
          }}
          className="pointer-events-none border-3 border-black shadow-[0_0_0_4px_#FEF08A] rounded-sm animate-pulse"
        >
          {/* 4 Corner Neo-Brutalist Beacons */}
          <span className="absolute -top-2 -left-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
          <span className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
          <span className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#FEF08A] border-2 border-black shadow-[1px_1px_0px_#000]" />
        </div>
      )}

      {/* 3. Anchored Guided Popover Card */}
      <div
        ref={popoverRef}
        style={popoverStyle}
        className="neo-box-lg bg-[#FFFDF9] flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_#000000] z-[9999] transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
      >
        {/* Header Ribbon */}
        <div className={`p-3.5 sm:p-4 border-b-3 border-black flex items-center justify-between ${bgVariantClass} transition-colors duration-150`}>
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

        {/* Step Progress Bar */}
        <div className="w-full bg-neutral-200 h-1.5 border-b-2 border-black flex overflow-hidden">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 border-r border-black last:border-r-0 transition-all duration-200 ${
                idx <= currentStepIndex ? "bg-black" : "bg-neutral-100"
              }`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-left">
          {isNavigating ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-black" />
              <span className="text-xs font-black uppercase text-black">
                Navigating to {currentStep.route}...
              </span>
            </div>
          ) : (
            <>
              {/* Title & Subtitle */}
              <div>
                <h2 
                  id="tour-step-title"
                  className="text-lg sm:text-xl font-black uppercase tracking-tight text-black leading-tight"
                >
                  {currentStep.title}
                </h2>
                <p className="text-xs font-bold text-neutral-800 mt-0.5">
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Description Box */}
              <p className="text-xs font-medium text-neutral-900 leading-relaxed bg-[#FFFBEB] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {currentStep.description}
              </p>

              {/* Key Takeaways */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-black block">
                  Key Takeaways:
                </span>
                <ul className="space-y-1">
                  {currentStep.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs font-bold text-black">
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
            </>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 sm:p-4 bg-white border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-2.5">
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
              [← / → keys]
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
                className="neo-btn bg-black text-white py-2 px-4 text-xs font-black uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#FEF08A]"
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
