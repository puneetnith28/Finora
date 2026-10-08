"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Cpu, Database, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f382c] text-white dark:bg-emerald-500 dark:text-slate-950">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Finora
              </span>
            </div>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Transparent, deterministic education loan evaluation and underwriting engine. 
              Designed for study-abroad aspirants to calculate accurate study budgets, verify funding sources, 
              and match with public, private, and NBFC lenders with full audit trail transparency.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                RBI / NBFC Compliant FOIR
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Deterministic Rule Engine
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Assessment Workflows
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/assessment?step=1" className="hover:text-emerald-600 transition-colors">
                  1. Student Profile
                </Link>
              </li>
              <li>
                <Link href="/assessment?step=2" className="hover:text-emerald-600 transition-colors">
                  2. Study Cost Calculator
                </Link>
              </li>
              <li>
                <Link href="/assessment?step=3" className="hover:text-emerald-600 transition-colors">
                  3. Funding Sources
                </Link>
              </li>
              <li>
                <Link href="/assessment?step=4" className="hover:text-emerald-600 transition-colors">
                  4. Financial & FOIR Profile
                </Link>
              </li>
              <li>
                <Link href="/assessment?step=5" className="hover:text-emerald-600 transition-colors">
                  5. Collateral & LTV
                </Link>
              </li>
              <li>
                <Link href="/assessment?step=6" className="hover:text-emerald-600 transition-colors">
                  6. Assessment Audit & Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Reference & Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Engine Specifications
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/lenders" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  Lender Underwriting Matrix
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  Document Readiness Vault
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Database className="h-3.5 w-3.5" />
                  Local Engine (Port 8000)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Finora. All calculations, readiness bands, and lender rule evaluations are deterministic and non-binding.</p>
          <div className="flex gap-4">
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              ZERO HIDDEN RULE EVALUATION
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
