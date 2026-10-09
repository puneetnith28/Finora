"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { NeoBadge } from "../ui/NeoPrimitives";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "run-finora",
    question: "Does this platform run the live Finora engine?",
    answer:
      "Yes. Every calculation—multi-currency tuition conversion, living expenses, FOIR debt burden, collateral haircuts, net worth, and lender eligibility matching—runs authoritatively on our FastAPI backend engine and produces deterministic, snapshot-reproducible records.",
  },
  {
    id: "drives-handoff",
    question: "How does the lender eligibility matching engine work?",
    answer:
      "Finora uses a deterministic multi-dimensional rule evaluator. It checks candidate parameters (target country, degree type, requested loan amount, CIBIL score, co-borrower monthly income, FOIR ratio, and pledged collateral) against explicit bank-underwritten criteria with zero black-box heuristics.",
  },
  {
    id: "real-records",
    question: "Are these real Indian banking and NBFC criteria?",
    answer:
      "Yes. All criteria are calibrated against the official GradGuide lender database, public sector bank policies (State Bank of India, Bank of Baroda, Bank of India), and dedicated education NBFCs (HDFC Credila, Auxilo Finserve) for pre-underwriting assessment.",
  },
  {
    id: "foir-explanation",
    question: "What is FOIR and why is it critical for education loans?",
    answer:
      "FOIR (Fixed Obligation to Income Ratio) measures what percentage of the co-borrower's monthly income goes towards paying existing debts plus the proposed education loan EMI. Public sector banks typically enforce a strict 40% to 50% FOIR ceiling, while specialist NBFCs allow up to 60%–65%.",
  },
  {
    id: "funding-gap",
    question: "How is the required loan gap calculated?",
    answer:
      "Finora computes total study cost (tuition fee + living expenses + travel/visa/insurance) in foreign currency, converts it to INR using live benchmark exchange rates, and subtracts declared self-funding (scholarships, savings, family contributions). If funding exceeds costs, the gap is safely floored at ₹0.",
  },
  {
    id: "open-records",
    question: "Can I inspect the full underwriting audit record?",
    answer:
      "Yes. Every completed assessment generates an immutable audit record displaying the complete rule evaluation matrix, actual vs. expected thresholds, pass/fail states, and exact reason codes for every lender.",
  },
  {
    id: "uncertain-outcome",
    question: "What happens when an eligibility match is conditional or fails?",
    answer:
      "Finora classifies matches into Direct Approval (Eligible), Conditional Approval (Needs Review), and Ineligible. For conditional or failed matches, specific remedial playbooks are provided (such as adding a salaried co-borrower, extending loan tenure, or pledging tangible collateral).",
  },
  {
    id: "document-ocr",
    question: "How does the document vault and OCR discrepancy audit work?",
    answer:
      "The vault provides isolated file storage with magic-byte MIME validation (PDF, JPG, PNG) and cross-checks student-entered income figures against parsed tax filings (ITR-V) and salary slips to catch discrepancies before official bank submission.",
  },
  {
    id: "prod-ready",
    question: "Is Finora production ready and verifiable?",
    answer:
      "Yes. Finora features automated regression test suites, strict security headers, CORS protection, comprehensive type safety, and printable counselor-ready assessment dossiers.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("run-finora");

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full bg-[#FFFDF9] border-b-2 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Title */}
        <div className="lg:col-span-4 space-y-3">
          <NeoBadge variant="cyan">A FEW HONEST ANSWERS</NeoBadge>
          <h3 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">
            WHAT TO KNOW.
          </h3>
          <p className="text-xs sm:text-sm font-bold text-neutral-800 leading-relaxed">
            Transparent education loan pre-underwriting with verifiable audit trails you can inspect.
          </p>
        </div>

        {/* Right Accordion List */}
        <div className="lg:col-span-8 border-t-2 border-black">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="border-b-2 border-black">
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full py-4.5 px-3 text-left flex items-center justify-between gap-4 font-black text-xs sm:text-sm uppercase tracking-tight hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <span className="text-black font-black">{faq.question}</span>
                  <span className="p-1 border-2 border-black bg-white shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-5 pt-1 px-3 text-xs font-bold text-neutral-800 leading-relaxed animate-in fade-in duration-150">
                    <p className="bg-[#FEF08A] p-4 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-black">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
