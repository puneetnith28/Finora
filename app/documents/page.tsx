"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  UploadCloud, 
  ArrowRight, 
  Lock, 
  Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface DocumentItem {
  id: string;
  name: string;
  category: "academic" | "income" | "collateral" | "identity";
  requiredFor: string;
  status: "verified" | "pending" | "missing";
  uploadedDate?: string;
  fileName?: string;
  fileSize?: string;
}

const DOCUMENT_TAXONOMY: DocumentItem[] = [
  {
    id: "doc-1",
    name: "University Admission Offer Letter",
    category: "academic",
    requiredFor: "All Lenders (Mandatory)",
    status: "verified",
    uploadedDate: "2026-03-15",
    fileName: "cmu_admission_offer_2026.pdf",
    fileSize: "1.4 MB",
  },
  {
    id: "doc-2",
    name: "Co-Borrower 2-Year IT Returns & Form 16",
    category: "income",
    requiredFor: "Indian Public & NBFC Lenders",
    status: "verified",
    uploadedDate: "2026-03-16",
    fileName: "itr_ay2025_2026_parent.pdf",
    fileSize: "2.8 MB",
  },
  {
    id: "doc-3",
    name: "6-Month Salary Bank Account Statement",
    category: "income",
    requiredFor: "Salaried Co-Borrower FOIR Verification",
    status: "verified",
    uploadedDate: "2026-03-16",
    fileName: "sbi_bank_statement_6months.pdf",
    fileSize: "4.1 MB",
  },
  {
    id: "doc-4",
    name: "Property Title Deed & Non-Encumbrance Certificate",
    category: "collateral",
    requiredFor: "Mandatory only if pledging property",
    status: "pending",
  },
  {
    id: "doc-5",
    name: "Student Passport & Identity Proof",
    category: "identity",
    requiredFor: "KYC & Foreign Remittance",
    status: "verified",
    uploadedDate: "2026-03-14",
    fileName: "passport_front_back.pdf",
    fileSize: "850 KB",
  },
  {
    id: "doc-6",
    name: "Scholarship Award Letter",
    category: "academic",
    requiredFor: "Optional (if claiming scholarship)",
    status: "missing",
  },
];

export default function DocumentsPage() {
  const [filter, setFilter] = useState<"all" | "academic" | "income" | "collateral">("all");
  const docs = DOCUMENT_TAXONOMY;

  const filtered = docs.filter((d) => {
    if (filter === "all") return true;
    return d.category === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Document Readiness Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pre-Underwriting Verification Vault
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            Ensure all income proof, academic acceptance, and property documents are ready 
            before bank verification agents begin physical and legal audits.
          </p>
        </div>

        <Link href="/assessment">
          <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Run Loan Assessment
          </Button>
        </Link>
      </div>

      {/* Upload Drag-and-Drop Mock Zone */}
      <div className="p-8 rounded-3xl border-2 border-dashed border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 text-center space-y-3">
        <UploadCloud className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Upload Verified Financial & Academic Proofs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            PDF, JPG, PNG up to 10MB per file. Sensitive PAN and bank account numbers are protected with end-to-end encryption.
          </p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Lock className="h-3.5 w-3.5" />}>
          Select Files to Upload
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg ${filter === "all" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600"}`}
        >
          All Documents
        </button>
        <button
          onClick={() => setFilter("academic")}
          className={`px-3 py-1.5 rounded-lg ${filter === "academic" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600"}`}
        >
          Academic & Admission
        </button>
        <button
          onClick={() => setFilter("income")}
          className={`px-3 py-1.5 rounded-lg ${filter === "income" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600"}`}
        >
          Co-Borrower Income
        </button>
        <button
          onClick={() => setFilter("collateral")}
          className={`px-3 py-1.5 rounded-lg ${filter === "collateral" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600"}`}
        >
          Collateral Deeds
        </button>
      </div>

      {/* Document Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc) => (
          <Card key={doc.id} className="p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {doc.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {doc.requiredFor}
                  </span>
                  {doc.fileName && (
                    <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">
                      {doc.fileName} ({doc.fileSize})
                    </div>
                  )}
                </div>
              </div>

              <Badge
                variant={
                  doc.status === "verified"
                    ? "success"
                    : doc.status === "pending"
                    ? "warning"
                    : "outline"
                }
              >
                {doc.status.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {doc.uploadedDate ? `Uploaded on ${doc.uploadedDate}` : "Action required"}
              </span>
              <Button variant="ghost" size="sm">
                {doc.status === "verified" ? "View / Replace" : "Upload File"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
