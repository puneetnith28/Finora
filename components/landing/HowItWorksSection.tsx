"use client";

import React from "react";

export function HowItWorksSection() {
  const STEPS = [
    {
      num: "01",
      title: "READ THE REPORT.",
      bg: "bg-white",
      description:
        "A Finora engine inspects target university fee structures and currency exchange benchmarks through a typed tool. Code validates selected expenses against published I-20 thresholds.",
    },
    {
      num: "02",
      title: "BOUND THE ACTION.",
      bg: "bg-[#BAE6FD]",
      description:
        "The engine evaluates co-borrower FOIR, debt service capability, and collateral haircuts in strict sequence. Unviable or out-of-scope requests cannot become execution actions.",
    },
    {
      num: "03",
      title: "VERIFY THE RESULT.",
      bg: "bg-[#FEF08A]",
      description:
        "Read the lender records back. Reuse verified benchmarks on retry; hold ambiguous criteria and boundary conditions for advisor review.",
    },
  ];

  return (
    <section
      data-tour="how-it-works-section"
      className="w-full bg-[#86EFAC] border-b-3 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Sticker Badge */}
        <div>
          <span className="inline-block bg-white text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
            HOW IT WORKS
          </span>
        </div>

        {/* Big Bold Headline */}
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
          FROM REPORT
          <br />
          TO READ BACK.
        </h2>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className={`${step.bg} border-3 border-black p-6 sm:p-7 shadow-[5px_5px_0px_#000000] flex flex-col justify-between space-y-6 transition-all hover:translate-x-[2px] hover:translate-y-[2px]`}
            >
              <div className="space-y-4">
                <span className="font-mono font-black text-sm text-black block">{step.num}</span>

                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">
                  {step.title}
                </h3>

                <p className="text-sm sm:text-base font-bold text-black leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Explanatory Footnote */}
        <p className="text-sm sm:text-base font-bold text-black/90 max-w-4xl pt-2 leading-relaxed">
          The rule engine proposes the eligibility match; deterministic code validates it. A valid
          profile is not proof that the match is irrevocably sanctioned, and ambiguous matches are
          flagged for human advisor review.
        </p>
      </div>
    </section>
  );
}
