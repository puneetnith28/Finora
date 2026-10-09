export type TourAccentColor = "yellow" | "cyan" | "mint" | "pink" | "white" | "black";

export type TourIllustrationType =
  | "welcome"
  | "wizard"
  | "simulator"
  | "lenders"
  | "vault"
  | "audit"
  | "ready";

export interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accentColor: TourAccentColor;
  targetElementSelector?: string;
  description: string;
  keyTakeaways: string[];
  visualBadge?: string;
  interactiveFeature?: {
    label: string;
    actionUrl: string;
    actionText: string;
  };
  illustrationType: TourIllustrationType;
}

export interface TourContextValue {
  isOpen: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  totalSteps: number;
  hasSeenTour: boolean;
  startTour: (initialStepIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  closeTour: () => void;
  finishTour: () => void;
  restartTour: () => void;
}
