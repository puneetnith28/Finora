"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t-2 border-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border-2 border-black bg-black text-[#FEF08A] shadow-[2px_2px_0px_0px_#000000]">
            <span className="font-black text-sm">F</span>
          </div>
          <span className="font-black text-lg tracking-tight text-black uppercase">FINORA.</span>
        </div>

        {/* Right Info Note */}
        <div className="text-xs font-bold text-neutral-800 text-center sm:text-right">
          Education Loan Underwriting Engine • This platform generates verifiable loan readiness
          audits.
        </div>
      </div>
    </footer>
  );
}
