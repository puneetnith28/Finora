export type TourAccentColor = "yellow" | "cyan" | "mint" | "pink" | "white" | "black";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  id: string;
  route: string;
  targetElementSelector: string;
  placement: TourPlacement;
  title: string;
  subtitle: string;
  tag: string;
  accentColor: TourAccentColor;
  description: string;
  keyTakeaways: string[];
  actionTip?: string;
}

export interface TourContextValue {
  isOpen: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  totalSteps: number;
  hasSeenTour: boolean;
  isNavigating: boolean;
  targetRect: DOMRect | null;
  startTour: (initialStepIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  closeTour: () => void;
  finishTour: () => void;
  restartTour: () => void;
}
