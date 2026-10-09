"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TourContextValue } from "@/lib/types/tour";
import { TOUR_STEPS } from "@/lib/constants/tourSteps";

const TOUR_STORAGE_KEY = "finora_tour_completed_v1";

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const startTour = useCallback((initialStepIndex = 0) => {
    const validIndex = Math.max(0, Math.min(initialStepIndex, TOUR_STEPS.length - 1));
    setCurrentStepIndex(validIndex);
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  const finishTour = useCallback(() => {
    setIsOpen(false);
    setHasSeenTour(true);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  }, []);

  const restartTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < TOUR_STEPS.length - 1) {
        return prev + 1;
      } else {
        finishTour();
        return prev;
      }
    });
  }, [finishTour]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeTour();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextStep, prevStep, closeTour]);

  // Lock body scroll when tour is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  const value: TourContextValue = {
    isOpen,
    currentStepIndex,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    hasSeenTour,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    closeTour,
    finishTour,
    restartTour,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
