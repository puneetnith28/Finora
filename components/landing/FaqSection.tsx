"use client";

import React, { useState } from "react";
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
      "Yes. Every calculation—currency conversion, FOIR, LTV haircuts, net worth, and lender rule evaluations—runs on our FastAPI backend engine and produces deterministic, snapshot-reproducible records.",
  },
  {
    id: "drives-handoff",
    question: "What actually drives the lender handoff?",
    answer:
      "The handoff is powered by a multi-dimensional rule evaluator. It matches student criteria (CIBIL, FOIR, max loan amount, collateral, degree type) against explicit rules with zero hidden heuristics.",
  },
  {
    id: "real-records",
    question: "Are these real banking criteria?",
    answer:
      "All lender criteria are calibrated against the official GradGuide education loan benchmarks, Indian public sector banks (SBI, Bank of Baroda, Bank of India), and premier education NBFCs (HDFC Credila, Auxilo Finserve) for pre-underwriting assessment.",
  },
  {
    id: "open-records",
    question: "Can I inspect the underwriting audit record?",
    answer:
      "Yes. Every assessment creates a permanent immutable record containing the full rule audit matrix, actual vs. expected thresholds, and exact reason codes for every lender.",
  },
  {
    id: "uncertain-outcome",
    question: "What happens when an outcome is conditional or fails?",
    answer:
      "Finora classifies matches into Eligible, Needs Review (Conditional), and Hard Failures. For review items, specific remedial actions (such as adding a co-borrower or pledging property) are listed.",
  },
  {
    id: "retry-proof",
    question: "What does the replay verification prove?",
    answer:
      "It proves zero mathematical drift. Evaluating the same candidate profile against the same lender rules always produces identical scores, FOIR ratios, and eligibility states.",
  },
  {
    id: "prod-ready",
    question: "Is Finora production ready?",
    answer:
      "Finora is built with production Docker containerization, security headers, MIME file validation, comprehensive unit & integration tests, and counselor-ready printable reports.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

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
            A transparent education loan platform with verifiable audit trails you can inspect.
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
                  className="w-full py-4 text-left flex items-center justify-between gap-4 font-black text-xs sm:text-sm uppercase tracking-tight hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-black">
                    <span className="text-[10px] transform transition-transform">
                      {isOpen ? "▼" : "►"}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-4 pt-1 pr-6 pl-4 text-xs font-bold text-neutral-800 leading-relaxed">
                    <p className="bg-[#FEF08A] p-3 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
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
