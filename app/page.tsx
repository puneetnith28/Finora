import { HealthStatus } from "@/components/HealthStatus";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-8 sm:p-16 font-sans">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
            <span className="text-xl font-bold tracking-tight text-white">Finora</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Education Loan Assessment & Financial Readiness Platform
          </p>
        </div>
        <HealthStatus />
      </header>

      <main className="my-auto py-12 max-w-2xl">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 mb-6">
          Phase 1 Complete — Foundation Verified
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Transparent loan readiness for study-abroad dreams.
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 leading-relaxed mb-8">
          Finora calculates your study costs, evaluates available funding, verifies financial
          readiness, and matches you deterministically with top education loan providers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
              Backend
            </div>
            <div className="font-semibold text-white">FastAPI & SQLite</div>
            <p className="text-xs text-neutral-400 mt-1">
              Deterministic calculations & rule engine
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
              Frontend
            </div>
            <div className="font-semibold text-white">Next.js 16 (App Router)</div>
            <p className="text-xs text-neutral-400 mt-1">Interactive simulator & student flow</p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
              Assessment
            </div>
            <div className="font-semibold text-white">Explainable Criteria</div>
            <p className="text-xs text-neutral-400 mt-1">Reproducible lender decisions</p>
          </div>
        </div>
      </main>

      <footer className="pt-6 border-t border-neutral-800/80 text-xs text-neutral-400 flex flex-col sm:flex-row justify-between gap-2">
        <div>Finora &copy; 2026 — All rights reserved.</div>
        <div className="font-mono text-neutral-400">Environment: Foundation Ready</div>
      </footer>
    </div>
  );
}
