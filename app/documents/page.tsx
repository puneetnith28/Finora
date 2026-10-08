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
  Plus,
  ShieldCheck,
  Lock
} from "lucide-react";
import { api, ApiClientError } from "@/lib/api";
import { DiscrepancyViewer } from "@/components/documents/DiscrepancyViewer";
import { ReadinessItem, ReadinessReport } from "@/types";
import { useStudent } from "@/lib/context/StudentContext";

export default function DocumentsPage() {
  const { activeStudentId = 1 } = useStudent();
  const studentId = activeStudentId || 1;

  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("admission_letter");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadReadiness = async () => {
    try {
      const data = await api.get<ReadinessReport>(`/api/students/${studentId}/documents/readiness`);
      setReport(data);
    } catch {
      // Keep existing report
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get<ReadinessReport>(`/api/students/${studentId}/documents/readiness`)
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
      await api.upload(`/api/students/${studentId}/documents`, formData);
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
    <div className="bg-[#BAE6FD] min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-3 border-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Alert Banner */}
        {alert && (
          <div
            className={`p-4 border-3 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-between text-xs sm:text-sm font-black uppercase ${
              alert.type === "success"
                ? "bg-[#86EFAC] text-black"
                : "bg-[#FECDD3] text-black"
            }`}
          >
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              className="neo-btn bg-white text-black text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-3 border-black">
          <div>
            <div className="inline-block bg-[#FEF08A] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider -rotate-1 shadow-[2px_2px_0px_#000000] mb-3">
              PRE-UNDERWRITING VAULT • MAGIC-BYTE VERIFIED
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
              DOCUMENT READINESS VAULT
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black/80 mt-2 max-w-2xl">
              Deterministic verification vault. Upload proof documents for admission, co-borrower income, tax filings, and collateral with isolated magic-byte verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadReadiness}
              className="neo-btn bg-white text-black text-xs font-black uppercase py-2.5 px-4 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4 stroke-[2.5]" />
              Refresh Vault
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="neo-box p-6 bg-[#FFFDF9]">
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#86EFAC] border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000000] shrink-0">
                  <UploadCloud className="h-6 w-6 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-black">
                    Upload Underwriting Evidence
                  </h3>
                  <span className="text-xs font-bold text-black/60 block">
                    Supported: PDF, JPG, PNG (Max 10MB per document)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="neo-input text-xs font-bold py-2 px-3 bg-white"
                >
                  <option value="admission_letter">Admission Offer Letter</option>
                  <option value="passport">Passport / National ID</option>
                  <option value="salary_slip">Salary Slip (3-6 Months)</option>
                  <option value="itr">Income Tax Returns (ITR-V)</option>
                  <option value="bank_statement">6-Month Bank Statement</option>
                  <option value="property_document">Property Title Deed / Collateral</option>
                  <option value="scholarship_proof">Scholarship Award Letter</option>
                  <option value="other">Other Supporting Document</option>
                </select>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  className="text-xs font-bold text-black file:mr-2 file:py-2 file:px-3 file:border-2 file:border-black file:text-xs file:font-black file:uppercase file:bg-[#FEF08A] file:cursor-pointer file:shadow-[2px_2px_0px_#000000] cursor-pointer"
                />

                <button
                  type="submit"
                  disabled={uploading || !fileToUpload}
                  className="neo-btn bg-[#86EFAC] text-black text-xs font-black uppercase py-2.5 px-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  {uploading ? "Verifying..." : "Upload"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Compliance Overview Grid */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="neo-box p-4 bg-[#FFFDF9]">
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Readiness Status</span>
              <div className="text-xl font-black uppercase text-black mt-1">
                {report.overall_readiness.replace("_", " ")}
              </div>
            </div>
            <div className="neo-box p-4 bg-[#FFFDF9]">
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Total Required</span>
              <div className="text-xl font-black font-mono text-black mt-1">
                {report.total_required} Dossiers
              </div>
            </div>
            <div className="neo-box p-4 bg-[#86EFAC]">
              <span className="text-[10px] font-black uppercase tracking-wider text-black block">Verified</span>
              <div className="text-xl font-black font-mono text-black mt-1">
                {report.total_uploaded} Uploaded
              </div>
            </div>
            <div className="neo-box p-4 bg-[#FECDD3]">
              <span className="text-[10px] font-black uppercase tracking-wider text-black block">Pending Proof</span>
              <div className="text-xl font-black font-mono text-black mt-1">
                {report.total_missing} Action Items
              </div>
            </div>
          </div>
        )}

        {/* Discrepancy Reconciliation Engine Card */}
        <DiscrepancyViewer />

        {/* Document Items Grid */}
        {loading ? (
          <div className="neo-box p-12 text-center text-sm font-black uppercase bg-[#FFFDF9]">
            Loading document verification vault...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report?.items.map((item, idx) => {
              const isVerified = item.status === "verified" || item.status === "uploaded";

              return (
                <div
                  key={idx}
                  className={`border-3 border-black p-6 flex flex-col justify-between transition-all ${
                    isVerified
                      ? "bg-white shadow-[6px_6px_0px_#86EFAC]"
                      : "bg-white shadow-[6px_6px_0px_#FECDD3]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_#000000] ${
                            isVerified ? "bg-[#86EFAC]" : "bg-[#FECDD3]"
                          }`}
                        >
                          <FileText className="h-5 w-5 text-black stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="font-black uppercase tracking-tight text-black text-base">
                            {item.title}
                          </h4>
                          <p className="text-xs font-medium text-black/70 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000000] shrink-0 ${
                          isVerified ? "bg-[#86EFAC] text-black" : "bg-[#FECDD3] text-black"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    {item.file_name && (
                      <div className="p-3 bg-[#F3F4F6] border-2 border-black text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 stroke-[3]" />
                          <span className="font-mono font-bold truncate">{item.file_name}</span>
                        </div>
                        {item.uploaded_at && (
                          <span className="text-[10px] font-mono font-bold text-black/60 shrink-0 ml-2">
                            {new Date(item.uploaded_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    {item.remedial_note && (
                      <div className="p-3 bg-[#FEF08A] border-2 border-black text-xs font-bold text-black flex items-start gap-2 shadow-[2px_2px_0px_#000000]">
                        <AlertTriangle className="h-4 w-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{item.remedial_note}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
                      {item.mandatory ? "• Mandatory for Sanction" : "• Contextual / Optional"}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.uploaded_document_id && (
                        <>
                          <button
                            onClick={() => {
                              setPreviewDocId(item.uploaded_document_id || null);
                              setPreviewFileName(item.file_name || "document.pdf");
                            }}
                            className="neo-btn bg-white text-black text-[11px] font-black uppercase py-1 px-2.5 flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5 stroke-[2.5]" /> Preview
                          </button>
                          <a
                            href={`/api/documents/${item.uploaded_document_id}/preview?download=true`}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            <button className="neo-btn bg-white text-black text-[11px] font-black uppercase py-1 px-2.5 flex items-center gap-1">
                              <Download className="h-3.5 w-3.5 stroke-[2.5]" /> Download
                            </button>
                          </a>
                          <button
                            onClick={() => handleDelete(item.uploaded_document_id!)}
                            className="neo-btn bg-[#FECDD3] text-black text-[11px] font-black uppercase py-1 px-2 flex items-center"
                          >
                            <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Preview Drawer */}
        {previewDocId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-none p-4">
            <div className="bg-[#FFFDF9] border-3 border-black shadow-[8px_8px_0px_#000000] max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden">
              <div className="p-4 bg-[#FEF08A] border-b-3 border-black flex items-center justify-between">
                <div className="flex items-center gap-2 font-black uppercase text-black text-sm">
                  <FileText className="h-4 w-4 stroke-[2.5]" />
                  <span>{previewFileName}</span>
                </div>
                <button
                  onClick={() => setPreviewDocId(null)}
                  className="neo-btn bg-white text-black text-xs font-black uppercase px-3 py-1"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 w-full bg-white p-2">
                <iframe
                  src={`/api/documents/${previewDocId}/preview`}
                  className="w-full h-full border-2 border-black"
                  title="Document Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
