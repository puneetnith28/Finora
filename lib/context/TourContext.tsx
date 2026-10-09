"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TourContextValue, TourStep } from "@/lib/types/tour";
import { TOUR_STEPS } from "@/lib/constants/tourSteps";

const TOUR_STORAGE_KEY = "finora_tour_completed_v1";

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const currentStep: TourStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const targetElementRef = useRef<HTMLElement | null>(null);

  // Navigate to a specific step, handling cross-page transitions
  const executeStepTransition = useCallback((targetIndex: number) => {
    const validIndex = Math.max(0, Math.min(targetIndex, TOUR_STEPS.length - 1));
    const nextStepConfig = TOUR_STEPS[validIndex];
    setCurrentStepIndex(validIndex);

    if (nextStepConfig.route && pathname !== nextStepConfig.route) {
      setIsNavigating(true);
      router.push(nextStepConfig.route);
    } else {
      setIsNavigating(false);
    }
  }, [pathname, router]);

  // When step changes or route changes, locate the element and smooth scroll
  useEffect(() => {
    if (!isOpen) return;

    let retryCount = 0;
    const maxRetries = 30; // 3 seconds max polling for page render
    let animFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const startTrackingLoop = (el: HTMLElement) => {
      const startTime = performance.now();
      const trackDuration = 900; // ms to track smooth scrolling continuously

      const stepTrack = (now: number) => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        if (now - startTime < trackDuration) {
          animFrameId = requestAnimationFrame(stepTrack);
        }
      };

      animFrameId = requestAnimationFrame(stepTrack);
    };

    const locateAndHighlight = () => {
      const selector = currentStep.targetElementSelector;
      const el = document.querySelector(selector) as HTMLElement | null;

      if (el) {
        setIsNavigating(false);
        targetElementRef.current = el;

        // Smooth scroll element into view
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

        // Run continuous 60fps tracking during smooth scroll
        startTrackingLoop(el);

        // Also observe element size mutations
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            if (targetElementRef.current) {
              setTargetRect(targetElementRef.current.getBoundingClientRect());
            }
          });
          resizeObserver.observe(el);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(locateAndHighlight, 100);
      } else {
        // Fallback if element not found: display centered
        setIsNavigating(false);
        setTargetRect(null);
      }
    };

    locateAndHighlight();

    return () => {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isOpen, currentStepIndex, pathname, currentStep]);

  // Listen to window scroll and resize to keep spotlight synced
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      if (targetElementRef.current) {
        setTargetRect(targetElementRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const startTour = useCallback((initialStepIndex = 0) => {
    setIsOpen(true);
    executeStepTransition(initialStepIndex);
  }, [executeStepTransition]);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    setTargetRect(null);
  }, []);

  const finishTour = useCallback(() => {
    setIsOpen(false);
    setTargetRect(null);
    setHasSeenTour(true);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  }, []);

  const restartTour = useCallback(() => {
    startTour(0);
  }, [startTour]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      executeStepTransition(currentStepIndex + 1);
    } else {
      finishTour();
    }
  }, [currentStepIndex, executeStepTransition, finishTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      executeStepTransition(currentStepIndex - 1);
    }
  }, [currentStepIndex, executeStepTransition]);

  const goToStep = useCallback((index: number) => {
    executeStepTransition(index);
  }, [executeStepTransition]);

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

  const value: TourContextValue = {
    isOpen,
    currentStepIndex,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    hasSeenTour,
    isNavigating,
    targetRect,
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
