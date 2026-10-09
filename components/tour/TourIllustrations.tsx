import React from "react";
import { 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Sliders
} from "lucide-react";
import { TourIllustrationType } from "@/lib/types/tour";

interface TourIllustrationProps {
  type: TourIllustrationType;
}

export function TourIllustration({ type }: TourIllustrationProps) {
  switch (type) {
    case "welcome":
      return (
        <div className="w-full bg-[#FFFDF9] border-2 border-black p-4 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FEF08A] px-2 py-0.5 border border-black">
              Zero Guesswork
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-600">
              Deterministic Underwriting
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-[#86EFAC] border-2 border-black font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_#000000]">
              5 Lenders Verified
            </div>
            <div className="p-2 bg-[#BAE6FD] border-2 border-black font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_#000000]">
              0-100 Score Band
            </div>
            <div className="p-2 bg-[#F472B6] border-2 border-black font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_#000000]">
              Instant Audit
            </div>
          </div>
        </div>
      );

    case "wizard":
      return (
        <div className="w-full bg-[#FFFDF9] border-2 border-black p-4 space-y-2.5 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center justify-between text-[11px] font-black uppercase pb-2 border-b-2 border-black">
            <span>6-Stage Intake Workflow</span>
            <span className="bg-[#BAE6FD] px-2 py-0.5 border border-black">Complete Coverage</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-bold">
            <div className="bg-white p-2 border border-black flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000]">
              <span className="w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center shrink-0">1</span>
              <span>Student Profile</span>
            </div>
            <div className="bg-white p-2 border border-black flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000]">
              <span className="w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center shrink-0">2</span>
              <span>Study Plan & FX</span>
            </div>
            <div className="bg-white p-2 border border-black flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000]">
              <span className="w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center shrink-0">3</span>
              <span>Funding Gap</span>
            </div>
            <div className="bg-white p-2 border border-black flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000]">
              <span className="w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center shrink-0">4</span>
              <span>Co-Borrower FOIR</span>
            </div>
            <div className="bg-white p-2 border border-black flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000]">
              <span className="w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center shrink-0">5</span>
              <span>Collateral Haircuts</span>
            </div>
            <div className="bg-[#86EFAC] p-2 border border-black flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000] font-black">
              <span className="w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center shrink-0">6</span>
              <span>Multi-Match</span>
            </div>
          </div>
        </div>
      );

    case "simulator":
      return (
        <div className="w-full bg-[#FFFDF9] border-2 border-black p-4 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black uppercase flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" /> FOIR Stress Engine
            </span>
            <span className="bg-[#86EFAC] px-2 py-0.5 border border-black text-[10px] font-black uppercase">
              Live Slider Feedback
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span>FOIR Ratio:</span>
              <span className="font-mono font-black text-black">42.8% (Moderate Safe)</span>
            </div>
            <div className="w-full h-3 bg-neutral-200 border border-black overflow-hidden flex">
              <div className="h-full bg-[#86EFAC]" style={{ width: "40%" }} />
              <div className="h-full bg-[#FEF08A]" style={{ width: "10%" }} />
              <div className="h-full bg-[#FB923C]" style={{ width: "10%" }} />
              <div className="h-full bg-[#F472B6]" style={{ width: "40%" }} />
            </div>
          </div>
          <div className="text-[10px] font-bold text-neutral-700 bg-[#FFFBEB] p-2 border border-black">
            💡 Dynamic playbooks trigger instantly when obligations exceed 50% income ceiling.
          </div>
        </div>
      );

    case "lenders":
      return (
        <div className="w-full bg-[#FFFDF9] border-2 border-black p-3 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
          <div className="text-[11px] font-black uppercase border-b-2 border-black pb-1.5 flex justify-between">
            <span>Reference Database Preview</span>
            <span className="font-mono text-[10px] text-neutral-600">5 Direct Benchmarks</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-1.5 bg-[#FEF08A] border border-black font-bold">
              <span className="font-black block">SBI</span>
              <span>8.40% Secured • 9.40% Top 100</span>
            </div>
            <div className="p-1.5 bg-[#BAE6FD] border border-black font-bold">
              <span className="font-black block">Bank of Baroda</span>
              <span>8.95% (B) / 8.75% (G)</span>
            </div>
            <div className="p-1.5 bg-[#FECDD3] border border-black font-bold">
              <span className="font-black block">Bank of India</span>
              <span>9.00% • Collateral Only</span>
            </div>
            <div className="p-1.5 bg-[#86EFAC] border border-black font-bold">
              <span className="font-black block">HDFC Credila & Auxilo</span>
              <span>Up to 60-65% FOIR</span>
            </div>
          </div>
        </div>
      );

    case "vault":
      return (
        <div className="w-full bg-[#FFFDF9] border-2 border-black p-4 space-y-2.5 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black uppercase flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Contextual Evidence Vault
            </span>
            <span className="bg-[#F472B6] text-black px-2 py-0.5 border border-black text-[10px] font-black uppercase">
              OCR Engine
            </span>
          </div>
          <div className="space-y-1.5 text-[10px] font-bold">
            <div className="flex items-center justify-between p-1.5 bg-white border border-black">
              <span>KYC & Admission Offer Letter</span>
              <span className="text-[#16A34A] font-black">✓ Mandatory</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-white border border-black">
              <span>Property Title Deed (Collateral Route)</span>
              <span className="text-[#2563EB] font-black">⚡ Context-Aware</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-[#FEE2E2] border border-black text-red-800">
              <span>Declared ₹1.85L vs ITR ₹1.82L</span>
              <span className="font-black">⚠ OCR Flagged</span>
            </div>
          </div>
        </div>
      );

    case "audit":
      return (
        <div className="w-full bg-[#FFFDF9] border-2 border-black p-4 space-y-2.5 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-black uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Explainable Audit Dossier
            </span>
            <span className="bg-[#86EFAC] px-2 py-0.5 border border-black text-[10px] font-black uppercase">
              Printable PDF
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black">
            <div className="p-2 bg-[#86EFAC] border border-black">
              <span className="block text-sm">88</span>
              <span>Readiness</span>
            </div>
            <div className="p-2 bg-[#BAE6FD] border border-black">
              <span className="block text-sm">3/5</span>
              <span>Approved</span>
            </div>
            <div className="p-2 bg-[#FEF08A] border border-black">
              <span className="block text-sm">1</span>
              <span>Conditional</span>
            </div>
          </div>
          <p className="text-[10px] font-medium text-neutral-700 text-center">
            Complete criteria-by-criteria audit log ready for bankers & visa officers.
          </p>
        </div>
      );

    case "ready":
      return (
        <div className="w-full bg-[#FFFDF9] border-2 border-black p-4 space-y-3 shadow-[3px_3px_0px_0px_#000000] text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#86EFAC] border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="h-4 w-4" /> Everything is Ready
          </div>
          <p className="text-xs font-bold text-black max-w-md mx-auto">
            You are all set to evaluate study-abroad applications, stress-test debt ratios, or inspect verified bank underwriting guidelines.
          </p>
        </div>
      );
  }
}
