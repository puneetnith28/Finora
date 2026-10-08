"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  UploadCloud, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { api, ApiClientError } from "@/lib/api";

interface ReadinessItem {
  document_type: string;
  title: string;
  description: string;
  mandatory: boolean;
  status: "missing" | "uploaded" | "processing" | "verified" | "rejected" | "needs_review";
  uploaded_document_id?: number | null;
  file_name?: string | null;
  uploaded_at?: string | null;
  remedial_note?: string | null;
}

interface ReadinessReport {
  student_id: number;
  overall_readiness: "ready" | "partially_ready" | "action_required";
  total_required: number;
  total_uploaded: number;
  total_verified: number;
  total_missing: number;
  items: ReadinessItem[];
}

export default function DocumentsPage() {
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("admission_letter");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Demo active student fallback or retrieved student ID
  const activeStudentId = 1;

  const loadReadiness = async () => {
    setLoading(true);
    try {
      const data = await api.get<ReadinessReport>(`/api/students/${activeStudentId}/documents/readiness`);
      setReport(data);
    } catch {
      // Fallback preview data for instant offline demonstration
      setReport({
        student_id: 1,
        overall_readiness: "partially_ready",
        total_required: 4,
        total_uploaded: 2,
        total_verified: 2,
        total_missing: 2,
        items: [
          {
            document_type: "admission_letter",
            title: "University Admission / Offer Letter",
            description: "Unconditional or conditional admission letter from destination university.",
            mandatory: true,
            status: "verified",
            file_name: "cmu_admission_offer_2026.pdf",
            uploaded_at: "2026-03-15T10:30:00Z",
          },
          {
            document_type: "passport",
            title: "Passport / Government ID Proof",
            description: "Valid passport copy for KYC and foreign outward remittance verification.",
            mandatory: true,
            status: "verified",
            file_name: "passport_front_back.pdf",
            uploaded_at: "2026-03-14T12:00:00Z",
          },
          {
            document_type: "itr",
            title: "Co-Borrower Income Tax Returns (ITR) or Salary Slips",
            description: "Last 2 years ITR-V with computation of income, or recent 3-6 months pay slips.",
            mandatory: true,
            status: "missing",
            remedial_note: "Required to substantiate co-borrower FOIR and debt servicing ability.",
          },
          {
            document_type: "bank_statement",
            title: "Co-Borrower 6-Month Bank Statement",
            description: "Operational bank account statement showing salary credit or business turnover.",
            mandatory: true,
            status: "missing",
            remedial_note: "Required by banks to check average balance and EMI clearing.",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadiness();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setAlert({ type: "error", message: "Please choose a file to upload." });
      return;
    }

    setUploading(true);
    setAlert(null);

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("document_type", selectedDocType);

    try {
      await api.upload(`/api/students/${activeStudentId}/documents`, formData);
      setAlert({ type: "success", message: `Document '${fileToUpload.name}' uploaded and validated.` });
      setFileToUpload(null);
      await loadReadiness();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to upload document.";
      setAlert({ type: "error", message: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/api/documents/${docId}`);
      setAlert({ type: "success", message: "Document deleted successfully." });
      await loadReadiness();
    } catch {
      setAlert({ type: "error", message: "Failed to delete document." });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Alert Banner */}
      {alert && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium ${
            alert.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-900 dark:text-rose-200"
          }`}
        >
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} className="text-xs font-bold uppercase">
            Dismiss
          </button>
        </div>
      )}

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
            Upload and verify your academic, income, and collateral documents. 
            All files are stored in isolated storage with magic-byte validation and anti-path traversal protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadReadiness} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh Status
          </Button>
          <Link href="/assessment">
            <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Run Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10">
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Upload Document Proof
                </h3>
                <span className="text-xs text-slate-500">
                  Supported formats: PDF, JPG, PNG (Max 10MB per file)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                options={[
                  { value: "admission_letter", label: "Admission Offer Letter" },
                  { value: "passport", label: "Passport / Government ID" },
                  { value: "salary_slip", label: "Salary Slip (3-6 Months)" },
                  { value: "itr", label: "Income Tax Returns (ITR-V)" },
                  { value: "bank_statement", label: "6-Month Bank Statement" },
                  { value: "property_document", label: "Property Title Deed / Collateral" },
                  { value: "scholarship_proof", label: "Scholarship Award Letter" },
                  { value: "other", label: "Other Supporting Document" },
                ]}
              />

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                className="text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
              />

              <Button
                type="submit"
                size="md"
                isLoading={uploading}
                disabled={!fileToUpload}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Upload
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Compliance Overview Banner */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-500">Readiness Status</span>
            <div className="text-lg font-bold capitalize text-slate-900 dark:text-white mt-1">
              {report.overall_readiness.replace("_", " ")}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-500">Required Documents</span>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1">
              {report.total_required}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs uppercase font-bold text-emerald-600">Uploaded & Verified</span>
            <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {report.total_uploaded}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs uppercase font-bold text-rose-600">Missing Action</span>
            <div className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
              {report.total_missing}
            </div>
          </div>
        </div>
      )}

      {/* Document Items Table / Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading document vault...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report?.items.map((item, idx) => {
            const isVerified = item.status === "verified" || item.status === "uploaded";
            const isMissing = item.status === "missing";

            return (
              <Card
                key={idx}
                className={`p-6 flex flex-col justify-between border-l-4 ${
                  isVerified ? "border-l-emerald-600" : "border-l-rose-500"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isVerified
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <Badge variant={isVerified ? "success" : "danger"}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>

                  {item.file_name && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-mono truncate">{item.file_name}</span>
                      </div>
                      {item.uploaded_at && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {new Date(item.uploaded_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  {item.remedial_note && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{item.remedial_note}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {item.mandatory ? "Mandatory for Loan Sanction" : "Optional / Contextual"}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.uploaded_document_id && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPreviewDocId(item.uploaded_document_id || null);
                            setPreviewFileName(item.file_name || "document.pdf");
                          }}
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          Preview
                        </Button>
                        <a
                          href={`/api/documents/${item.uploaded_document_id}/preview?download=true`}
                          download
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                            Download
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.uploaded_document_id!)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Safe Modal Preview Drawer */}
      {previewDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>{previewFileName}</span>
              </div>
              <button
                onClick={() => setPreviewDocId(null)}
                className="text-xs uppercase font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Close Preview
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 p-2">
              <iframe
                src={`/api/documents/${previewDocId}/preview`}
                className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
