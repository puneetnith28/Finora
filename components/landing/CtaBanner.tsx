"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NeoBadge, NeoButton } from "../ui/NeoPrimitives";

export function CtaBanner() {
  return (
    <section className="w-full bg-[#000000] border-b-2 border-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="border-2 border-white bg-[#000000] p-8 sm:p-16 text-center text-white space-y-6 shadow-[8px_8px_0px_0px_#FEF08A]">
          <div>
            <NeoBadge variant="white" className="border-2 border-black">
              FOLLOW THE EVIDENCE
            </NeoBadge>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            THE HANDOFF IS <br />
            IN THE RECEIPT.
          </h2>

          <p className="text-xs sm:text-sm font-bold text-neutral-300 max-w-md mx-auto leading-relaxed">
            Run a deterministic loan readiness evaluation. Calculate your funding gap, 
            co-borrower FOIR, and see which lenders match with zero ambiguity.
          </p>

          <div className="pt-2 flex justify-center">
            <Link href="/assessment">
              <NeoButton variant="primary" size="lg">
                <span>EXPLORE THE RECORDED HANDOFF</span>
                <ArrowUpRight className="h-4 w-4" />
              </NeoButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
