import { TourStep } from "@/lib/types/tour";

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "WELCOME TO FINORA",
    subtitle: "The Zero-Guesswork Education Loan Pre-Underwriting Engine",
    tag: "ORIENTATION",
    accentColor: "yellow",
    targetElementSelector: "[data-tour='brand-logo']",
    description:
      "Finora is an institutional-grade loan readiness platform built specifically for study-abroad students and education counselors. Unlike traditional lead-gen aggregators, Finora uses deterministic, bank-grade mathematical models to eliminate loan rejection surprises before you apply.",
    keyTakeaways: [
      "100% deterministic evaluation — no black boxes or opaque machine learning models",
      "Official criteria from Indian public banks, private financiers, and specialist NBFCs",
      "Instant calculations for Multi-Currency Budgets, FOIR, Net Worth, and Collateral LTV",
    ],
    visualBadge: "AUDIT-READY ARCHITECTURE",
    illustrationType: "welcome",
  },
  {
    id: "wizard",
    title: "6-STEP ELIGIBILITY WIZARD",
    subtitle: "Structured Intake from Academic Admission to Tangible Collateral",
    tag: "CORE WORKFLOW",
    accentColor: "cyan",
    targetElementSelector: "[data-tour='nav-assessment']",
    description:
      "The loan assessment wizard captures every critical data point required by credit underwriters through a streamlined 6-step form. It handles currency conversion, girl student concessions, and co-borrower debt servicing automatically.",
    keyTakeaways: [
      "Step 1 & 2: Student KYC, target intake semester, country & university ranking tier",
      "Step 3: Self-funding breakdown (savings, scholarships, family funds) to find the Funding Gap",
      "Step 4 & 5: Co-borrower salary/ITR, existing EMIs, and pledged collateral haircuts",
      "Step 6: Real-time multi-lender underwriting match against official credit policies",
    ],
    visualBadge: "6-STAGE INTAKE PIPELINE",
    interactiveFeature: {
      label: "Evaluate Candidate Profile",
      actionUrl: "/assessment",
      actionText: "Open Assessment Wizard",
    },
    illustrationType: "wizard",
  },
  {
    id: "simulator",
    title: "REAL-TIME FOIR SIMULATOR",
    subtitle: "Eliminate the #1 Cause of Study-Abroad Loan Rejections",
    tag: "ORIGINAL FEATURE #1",
    accentColor: "mint",
    targetElementSelector: "[data-tour='nav-simulator']",
    description:
      "Fixed Obligation to Income Ratio (FOIR) measures what percentage of the co-borrower's monthly income is consumed by debt payments. Exceeding bank limits (usually 50-60%) causes over 80% of loan rejections. Finora's live simulator lets you adjust loan amounts, tenures, and income in real-time.",
    keyTakeaways: [
      "Real-time amortizing EMI calculations across varying loan tenures (up to 15 years)",
      "Dynamic color-coded risk bands: Safe (≤40%), Moderate (40-50%), Stretched (50-60%), High Risk (>60%)",
      "Actionable remedial playbooks: Add second co-borrower, extend tenure, or clear short-term personal loans",
    ],
    visualBadge: "STRESS-TEST DEBT RATIOS",
    interactiveFeature: {
      label: "Test Debt Capacity",
      actionUrl: "/simulator",
      actionText: "Launch FOIR Simulator",
    },
    illustrationType: "simulator",
  },
  {
    id: "lenders",
    title: "OFFICIAL LENDER UNDERWRITING MATRIX",
    subtitle: "Verified Policy Database for SBI, BOB, BOI, HDFC Credila & Auxilo",
    tag: "LENDER MATRIX",
    accentColor: "yellow",
    targetElementSelector: "[data-tour='nav-lenders']",
    description:
      "Inspect the exact criteria programmed into our engine. Finora reflects official lending terms: SBI & BOB collateral/non-collateral rates (including Top 100 University rules), Bank of India collateral mandates, 0.5% girl student concessions, and minimum CIBIL score cutoffs.",
    keyTakeaways: [
      "State Bank of India (SBI): 8.40% Collateral, 9.40% Non-Collateral (Top 100 Univs), Min CIBIL 750",
      "Bank of Baroda (BOB): 8.95% (Boys) / 8.75% (Girls), 8.45% Non-Collateral, Min CIBIL 700",
      "Bank of India (BOI): 9.00% (Boys) / 8.60% (Girls) Collateral only (Non-collateral not possible)",
      "HDFC Credila & Auxilo Finserve: Specialist NBFC routes with flexible 60-65% FOIR ceilings",
    ],
    visualBadge: "TRANSPARENT BANK BENCHMARKS",
    interactiveFeature: {
      label: "Browse All Policies",
      actionUrl: "/lenders",
      actionText: "View Underwriting Matrix",
    },
    illustrationType: "lenders",
  },
  {
    id: "vault",
    title: "DOCUMENT VAULT & OCR RECONCILIATION",
    subtitle: "Contextual Readiness Checklists & Automated Discrepancy Detection",
    tag: "ORIGINAL FEATURE #3",
    accentColor: "pink",
    targetElementSelector: "[data-tour='nav-documents']",
    description:
      "Lenders reject files when declared figures differ from uploaded proof. Finora's pre-underwriting vault dynamically builds a document checklist based on whether you choose the collateral or non-collateral route, then runs OCR discrepancy detection against bank statements and ITR-Vs.",
    keyTakeaways: [
      "Dynamic document checklists: Title deeds for property route; ITRs & salary slips for unsecured route",
      "Isolated evidence storage with magic-byte MIME validation and SHA-256 file checksums",
      "Automated OCR cross-reconciliation highlighting income gaps, name mismatches, or loan amount drifts",
    ],
    visualBadge: "INTELLIGENT EVIDENCE AUDIT",
    interactiveFeature: {
      label: "Check Document Readiness",
      actionUrl: "/documents",
      actionText: "Open Document Vault",
    },
    illustrationType: "vault",
  },
  {
    id: "audit",
    title: "DETERMINISTIC AUDIT DOSSIER",
    subtitle: "Mathematical Pass/Fail Traces & Counselor-Ready Printable PDF",
    tag: "ORIGINAL FEATURE #2",
    accentColor: "cyan",
    targetElementSelector: "[data-tour='hero-receipt']",
    description:
      "Every assessment produces a verifiable 0-100 Loan Readiness Score alongside rule-by-rule evaluations for each lender (Direct Approval, Conditional Approval, or Ineligible). Generate a professional, tamper-proof PDF audit dossier to take directly to the bank manager or visa counselor.",
    keyTakeaways: [
      "Dimensional scoring: Academic Merit, Financial FOIR Strength, Collateral LTV, and KYC Readiness",
      "Root-cause diagnostic notes explaining exactly why a rule failed and how to rectify it",
      "Print-optimized PDF dossier with timestamps, unique candidate ID, and underwriting trail",
    ],
    visualBadge: "ZERO BLACK BOXES",
    illustrationType: "audit",
  },
  {
    id: "ready",
    title: "READY TO EVALUATE YOUR LOAN?",
    subtitle: "Choose How You Want to Experience Finora",
    tag: "GET STARTED",
    accentColor: "mint",
    description:
      "You now have a complete picture of Finora's capabilities. Start a fresh evaluation for a candidate, load a pre-configured student persona, or stress-test debt scenarios on the simulator.",
    keyTakeaways: [
      "Evaluate Candidate: Fill out the 6-step form and get instant lender matching",
      "Try Demo Personas: Explore pre-configured profiles (Ivy League Scholar, Collateral Heavy, Borderline FOIR)",
      "Explore Anytime: You can re-open this tour guide at any moment from the top navigation bar",
    ],
    visualBadge: "AUDIT READY",
    interactiveFeature: {
      label: "Start Evaluation Now",
      actionUrl: "/assessment",
      actionText: "Begin Loan Assessment",
    },
    illustrationType: "ready",
  },
];
