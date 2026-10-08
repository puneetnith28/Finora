/**
 * Unified Demo Personas & Scenario Definitions
 * Single source of truth across Landing Page, Inspect Trail, and Evaluator Demo Mode.
 * Aligns 1:1 with backend /api/demo/seed cases.
 */

export interface DemoPersona {
  num: string;
  id: string;
  name: string;
  tag: string;
  badgeColor: "mint" | "cyan" | "pink" | "yellow" | "white";
  university: string;
  course: string;
  country: string;
  currency: string;
  loanNeeded: string;
  foir: string;
  score: string;
  status: string;
  profile: string;
  verdict: string;
  trail: Array<{
    app: string;
    result: string;
  }>;
}

export const CANONICAL_DEMO_PERSONAS: DemoPersona[] = [
  {
    num: "01",
    id: "aarav",
    name: "AARAV MEHTA",
    tag: "STEM USA • TIER-1",
    badgeColor: "mint",
    university: "Carnegie Mellon University",
    course: "MS in Computer Science",
    country: "United States",
    currency: "USD / INR",
    loanNeeded: "₹45,00,000",
    foir: "34%",
    score: "94/100",
    status: "APPROVED BY 4 LENDERS",
    profile: "CIBIL 780 • Co-borrower ₹1.6L/mo • ₹60L Property",
    verdict: "UNANIMOUS TIER-1 BANK APPROVAL (9.2%)",
    trail: [
      { app: "01 / Currency & Tuition", result: "Verified SEVP $48,000 tuition @ 85.0 INR conversion" },
      { app: "02 / Co-Borrower FOIR", result: "Monthly Income ₹1,60,000 against ₹8,000 existing EMIs" },
      { app: "03 / Underwriting Sync", result: "Direct match against SBI Global Ed-Vantage & HDFC Credila criteria" },
    ],
  },
  {
    num: "02",
    id: "priya",
    name: "PRIYA SHARMA",
    tag: "UK UNSECURED",
    badgeColor: "cyan",
    university: "London School of Economics",
    course: "MSc in Finance",
    country: "United Kingdom",
    currency: "GBP / INR",
    loanNeeded: "₹38,00,000",
    foir: "42%",
    score: "88/100",
    status: "APPROVED BY NBFC SPECIALISTS",
    profile: "CIBIL 725 • Co-borrower ₹95k/mo • No Collateral",
    verdict: "ELIGIBLE FOR SPECIALIST UNSECURED NBFCs",
    trail: [
      { app: "01 / Budget Audit", result: "£32,000 full tuition + London living allowance @ 108.0 INR" },
      { app: "02 / Debt Burden", result: "FOIR 42% — within standard NBFC risk allowance" },
      { app: "03 / Sanction Pathway", result: "Unsecured education loan approved by Avanse & HDFC Credila with 0 collateral" },
    ],
  },
  {
    num: "03",
    id: "ananya",
    name: "ANANYA IYER",
    tag: "GERMANY STEM",
    badgeColor: "yellow",
    university: "TU Munich",
    course: "MSc in Robotics",
    country: "Germany",
    currency: "EUR / INR",
    loanNeeded: "₹12,50,000",
    foir: "24%",
    score: "96/100",
    status: "APPROVED BY 5 LENDERS",
    profile: "€0 Tuition • €4k Award • ₹15L Fixed Deposit",
    verdict: "LOW BORROWING GAP • SCORE 96/100",
    trail: [
      { app: "01 / Blocked Account", result: "€12,000 mandatory living deposit + €4,000 scholarship offset" },
      { app: "02 / Debt Burden", result: "FOIR 24% — lowest tier risk category" },
      { app: "03 / Collateral Backing", result: "Liquid FD collateral with 90% haircut allowance" },
    ],
  },
  {
    num: "04",
    id: "rohan",
    name: "ROHAN VERMA",
    tag: "HIGH DEBT STRESS",
    badgeColor: "pink",
    university: "University of Toronto",
    course: "Rotman MBA",
    country: "Canada",
    currency: "CAD / INR",
    loanNeeded: "₹52,00,000",
    foir: "78%",
    score: "58/100",
    status: "FOIR STRESS • REMEDIAL PLAN",
    profile: "CIBIL 660 • Co-borrower ₹55k/mo • ₹32k Existing EMIs",
    verdict: "FOIR 78% WARNING • REMEDIAL ACTION REQUIRED",
    trail: [
      { app: "01 / Budget Audit", result: "CAD $45,000 tuition @ 62.0 INR conversion" },
      { app: "02 / Debt Burden Flag", result: "High FOIR (78%) exceeds maximum 50% bank risk ceiling" },
      { app: "03 / Remedial Engine", result: "Action Plan: Add second co-borrower or extend loan tenure to 15 years" },
    ],
  },
  {
    num: "05",
    id: "vikram",
    name: "VIKRAM PATEL",
    tag: "DISCREPANCY FLAG",
    badgeColor: "white",
    university: "University of Melbourne",
    course: "Master of Data Science",
    country: "Australia",
    currency: "AUD / INR",
    loanNeeded: "₹42,00,000",
    foir: "48%",
    score: "65/100",
    status: "CONDITIONAL • AUDIT FLAG",
    profile: "CIBIL 695 • Co-borrower ₹72k/mo • Unverified Deed",
    verdict: "CONDITIONAL • OCR DISCREPANCY DETECTED",
    trail: [
      { app: "01 / OCR Ingestion", result: "AUD $42,000 tuition scanned from offer letter" },
      { app: "02 / Document Audit", result: "Property deed verification pending title search verification" },
      { app: "03 / Conditional Sanction", result: "Preliminary sanction subject to collateral legal search" },
    ],
  },
];
