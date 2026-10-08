"use client";

import React, { useState } from "react";
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Fingerprint
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface DiscrepancyItem {
  id: string;
  field_name: string;
  document_type: string;
  user_entered_value: string | number;
  extracted_value: string | number;
  variance_percentage: number;
  tolerance_percentage: number;
  severity: "none" | "minor" | "major";
  needs_human_review: boolean;
  confidence_score: number;
  review_note: string;
  extraction_method: "pdf_stream" | "tesseract_ocr" | "regex_anchor";
}

interface DiscrepancyViewerProps {
  discrepancies?: DiscrepancyItem[];
}

const DEFAULT_DISCREPANCIES: DiscrepancyItem[] = [
  {
    id: "disc-1",
    field_name: "Co-Borrower Monthly Salary",
    document_type: "Salary Slip / Bank Statement",
    user_entered_value: "₹1,85,000 / mo",
    extracted_value: "₹1,82,450 / mo",
    variance_percentage: 1.38,
    tolerance_percentage: 10.0,
    severity: "minor",
    needs_human_review: false,
    confidence_score: 0.96,
    review_note: "Variance within 10% tolerance threshold (allowable PF/tax deductions). Automated rule passed.",
    extraction_method: "pdf_stream",
  },
  {
    id: "disc-2",
    field_name: "University Tuition Fee",
    document_type: "I-20 Form / Admission Offer",
    user_entered_value: "$42,500 / yr",
    extracted_value: "$42,500 / yr",
    variance_percentage: 0.0,
    tolerance_percentage: 5.0,
    severity: "none",
    needs_human_review: false,
    confidence_score: 0.99,
    review_note: "Exact match against published SEVP/I-20 tuition item.",
    extraction_method: "regex_anchor",
  },
  {
    id: "disc-3",
    field_name: "Candidate Passport Name",
    document_type: "Passport Bio Page",
    user_entered_value: "Aarav Sharma",
    extracted_value: "AARAV SHARMA",
    variance_percentage: 0.0,
    tolerance_percentage: 0.0,
    severity: "none",
    needs_human_review: false,
    confidence_score: 0.98,
    review_note: "Case-insensitive exact match against MRZ string line.",
    extraction_method: "tesseract_ocr",
  },
];

export function DiscrepancyViewer({ discrepancies = DEFAULT_DISCREPANCIES }: DiscrepancyViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const majorCount = discrepancies.filter((d) => d.severity === "major").length;
  const minorCount = discrepancies.filter((d) => d.severity === "minor").length;
  const matchCount = discrepancies.filter((d) => d.severity === "none").length;

  return (
    <div className="neo-box p-6 sm:p-8 bg-[#FFFDF9] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="inline-block bg-[#86EFAC] text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider mb-1">
            OCR RECONCILIATION ENGINE
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <Fingerprint className="h-6 w-6 stroke-[2.5]" />
            <span>Document vs Input Discrepancy Audit</span>
          </h3>
          <p className="text-xs sm:text-sm font-bold text-black/70">
            Automated verification comparing candidate-submitted numbers against parsed documents.
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-[#86EFAC] text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
            {matchCount} Matched
          </span>
          <span className="bg-[#FEF08A] text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
            {minorCount} Minor Tolerance
          </span>
          {majorCount > 0 && (
            <span className="bg-[#FECDD3] text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000]">
              {majorCount} Flagged
            </span>
          )}
        </div>
      </div>

      {/* Discrepancy List */}
      <div className="space-y-4">
        {discrepancies.map((item) => {
          const isExpanded = expandedId === item.id;
          const isOk = item.severity === "none";
          const isMinor = item.severity === "minor";

          return (
            <div
              key={item.id}
              className={`border-2 border-black transition-all ${
                isOk
                  ? "bg-white shadow-[3px_3px_0px_#86EFAC]"
                  : isMinor
                  ? "bg-white shadow-[3px_3px_0px_#FEF08A]"
                  : "bg-white shadow-[3px_3px_0px_#FECDD3]"
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-8 h-8 border-2 border-black flex items-center justify-center font-black shrink-0 ${
                      isOk
                        ? "bg-[#86EFAC]"
                        : isMinor
                        ? "bg-[#FEF08A]"
                        : "bg-[#FECDD3]"
                    }`}
                  >
                    {isOk ? (
                      <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
                    ) : isMinor ? (
                      <AlertTriangle className="w-4 h-4 text-black stroke-[3]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-black stroke-[3]" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black uppercase text-black">
                      {item.field_name}
                    </h4>
                    <span className="text-[11px] font-bold text-black/60 block">
                      Doc: {item.document_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-black/60 block">Variance</span>
                    <span className="font-black text-black">
                      {item.variance_percentage === 0 ? "0.00% (Exact)" : `${item.variance_percentage}%`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-black/60 block">OCR Conf.</span>
                    <span className="font-black text-black">
                      {(item.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <button className="p-1 border border-black bg-[#F3F4F6]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 stroke-[3]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="p-4 bg-[#FFFDF9] border-t-2 border-black text-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-black">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
                        Form Entered Value
                      </span>
                      <span className="font-mono font-bold text-black text-sm">
                        {String(item.user_entered_value)}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-black">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
                        Extracted Document Value
                      </span>
                      <span className="font-mono font-bold text-black text-sm">
                        {String(item.extracted_value)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FEF08A] border border-black flex items-start gap-2">
                    <Cpu className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
                    <div>
                      <span className="font-black uppercase text-[10px] text-black block">Engine Audit Note:</span>
                      <p className="font-bold text-black mt-0.5">{item.review_note}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
