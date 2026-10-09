"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Compass, 
  ExternalLink
} from "lucide-react";
import { useTour } from "@/lib/context/TourContext";
import { TourIllustration } from "./TourIllustrations";

export function ProductTourModal() {
  const {
    isOpen,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    closeTour,
    finishTour,
  } = useTour();

  const modalRef = useRef<HTMLDivElement>(null);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Focus trap & initial focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const bgVariantClass = {
    yellow: "bg-[#FEF08A]",
    cyan: "bg-[#BAE6FD]",
    mint: "bg-[#86EFAC]",
    pink: "bg-[#F472B6]",
    white: "bg-[#FFFDF9]",
    black: "bg-black text-white",
  }[currentStep.accentColor];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
      aria-describedby="tour-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeTour();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="neo-box-lg bg-[#FFFDF9] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_#000000] outline-none"
      >
        {/* Header Ribbon */}
        <div className={`p-4 sm:p-5 border-b-3 border-black flex items-center justify-between ${bgVariantClass} transition-colors duration-200`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000000] shrink-0">
              <Compass className="h-4 w-4 text-[#FEF08A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-black text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black">
                  {currentStep.tag}
                </span>
                <span className="text-[11px] font-mono font-black text-black">
                  STEP {currentStepIndex + 1} OF {totalSteps}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeTour}
              className="w-8 h-8 bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000000] hover:bg-neutral-100 transition-transform active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Close product tour"
            >
              <X className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 h-2 border-b-2 border-black flex overflow-hidden">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 border-r border-black last:border-r-0 transition-all duration-200 ${
                idx <= currentStepIndex ? "bg-black" : "bg-neutral-100"
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-left">
          {/* Title & Subtitle */}
          <div>
            <h2 
              id="tour-modal-title"
              className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight"
            >
              {currentStep.title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-800 mt-1">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Neo Illustration / Preview diagram */}
          <TourIllustration type={currentStep.illustrationType} />

          {/* Description */}
          <p 
            id="tour-modal-desc"
            className="text-xs sm:text-sm font-medium text-neutral-900 leading-relaxed bg-[#FFFBEB] p-3 sm:p-4 border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
          >
            {currentStep.description}
          </p>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black block">
              What You Should Know:
            </span>
            <ul className="space-y-1.5">
              {currentStep.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-bold text-black">
                  <span className="w-4 h-4 bg-[#86EFAC] border border-black flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_#000]">
                    <CheckCircle2 className="h-3 w-3 text-black stroke-[3]" />
                  </span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Feature Shortcut Link if present */}
          {currentStep.interactiveFeature && (
            <div className="pt-1">
              <Link 
                href={currentStep.interactiveFeature.actionUrl}
                onClick={closeTour}
                className="inline-flex items-center gap-2 text-xs font-black uppercase text-black bg-[#BAE6FD] hover:bg-[#7DD3FC] border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_#000000] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                <span>{currentStep.interactiveFeature.actionText}</span>
                <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 bg-white border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToStep(idx)}
                className={`w-3 h-3 border border-black transition-all ${
                  idx === currentStepIndex
                    ? "bg-black scale-110 shadow-[1px_1px_0px_0px_#000]"
                    : "bg-white hover:bg-neutral-200"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
            <span className="text-[10px] font-mono font-bold text-neutral-600 ml-2 hidden sm:inline">
              [← / → keys]
            </span>
          </div>

          {/* Navigation action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {!isFirstStep ? (
              <button
                type="button"
                onClick={prevStep}
                className="neo-btn bg-white hover:bg-neutral-100 text-black py-2 px-3 text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5 stroke-[3]" />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={closeTour}
                className="text-xs font-black uppercase text-neutral-600 hover:text-black py-2 px-3 underline decoration-black underline-offset-4"
              >
                Skip Guide
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={finishTour}
                className="neo-btn bg-[#86EFAC] hover:bg-[#4ADE80] text-black py-2.5 px-4 text-xs font-black uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000000]"
              >
                <span>Complete Tour 🎉</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="neo-btn bg-black text-white py-2.5 px-4 text-xs font-black uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#FEF08A]"
              >
                <span>Next Step</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
