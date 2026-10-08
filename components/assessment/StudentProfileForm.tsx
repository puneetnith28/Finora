"use client";

import React, { useState } from "react";
import { 
  User, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  ArrowUpRight 
} from "lucide-react";
import { NeoBadge, NeoButton, NeoInput } from "@/components/ui/NeoPrimitives";
import { studentSchema, type StudentFormData, STUDENT_PRESETS } from "@/lib/validations/student";

export interface StudentProfileFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function StudentProfileForm({
  initialData,
  onSubmit,
  isLoading = false,
}: StudentProfileFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    citizenship: initialData?.citizenship || "India",
    target_country: initialData?.target_country || "USA",
    target_university: initialData?.target_university || "",
    target_degree: initialData?.target_degree || "masters",
    target_course: initialData?.target_course || "",
    target_stem: initialData?.target_stem ?? true,
    intake_term: initialData?.intake_term || "Fall 2026",
    cibil_score: initialData?.cibil_score ?? 750,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const applyPreset = (presetId: string) => {
    const preset = STUDENT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFormData(preset.data);
      setErrors({});
    }
  };

  const handleChange = (field: keyof StudentFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = studentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Preset Quick Loader Banner */}
      <div className="neo-box-yellow p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <NeoBadge variant="white" className="border-2 border-black">
            <Sparkles className="h-3.5 w-3.5" />
            <span>QUICK LOAD DEMO PROFILES</span>
          </NeoBadge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STUDENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 border-2 border-black bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000000] transition-all cursor-pointer group"
            >
              <div className="font-black text-xs text-black uppercase">
                {preset.name}
              </div>
              <div className="text-[11px] font-bold text-neutral-600 truncate mt-0.5">
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="neo-box-lg bg-white p-6 sm:p-8 space-y-6">
        <div className="pb-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <NeoBadge variant="pink" rotate="left">
              01 / CANDIDATE PROFILE
            </NeoBadge>
            <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight mt-1">
              APPLICANT & UNIVERSITY TARGET
            </h2>
          </div>
          <span className="text-xs font-black uppercase text-neutral-600">
            STEP 1 OF 6
          </span>
        </div>

        {/* Section A: Personal Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
            PERSONAL DETAILS
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeoInput
              label="Full Name"
              placeholder="e.g. Priya Sharma"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              error={errors.full_name}
              required
            />

            <NeoInput
              label="Email Address"
              type="email"
              placeholder="priya@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              required
            />

            <NeoInput
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={errors.phone}
            />

            <NeoInput
              label="Citizenship"
              placeholder="India"
              value={formData.citizenship}
              onChange={(e) => handleChange("citizenship", e.target.value)}
              error={errors.citizenship}
              required
            />
          </div>
        </div>

        {/* Section B: Academic Target */}
        <div className="space-y-4 pt-4 border-t-2 border-black">
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
            DESTINATION & ACADEMIC MAJOR
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                Destination Country
              </label>
              <select
                value={formData.target_country}
                onChange={(e) => handleChange("target_country", e.target.value)}
                className="neo-input"
                required
              >
                <option value="USA">United States (USA)</option>
                <option value="United Kingdom">United Kingdom (UK)</option>
                <option value="Germany">Germany</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Ireland">Ireland</option>
                <option value="Singapore">Singapore</option>
                <option value="France">France</option>
              </select>
            </div>

            <NeoInput
              label="Target University"
              placeholder="e.g. Carnegie Mellon University"
              value={formData.target_university}
              onChange={(e) => handleChange("target_university", e.target.value)}
              error={errors.target_university}
              required
            />

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                Degree Level
              </label>
              <select
                value={formData.target_degree}
                onChange={(e) => handleChange("target_degree", e.target.value)}
                className="neo-input"
                required
              >
                <option value="masters">Master&apos;s Degree (MS / MBA / MA)</option>
                <option value="bachelors">Bachelor&apos;s Degree (BS / BA / B.Tech)</option>
                <option value="doctorate">Doctorate / PhD</option>
                <option value="diploma">Post-Graduate Diploma</option>
              </select>
            </div>

            <NeoInput
              label="Target Course / Major"
              placeholder="e.g. Computer Science"
              value={formData.target_course}
              onChange={(e) => handleChange("target_course", e.target.value)}
              error={errors.target_course}
              required
            />

            <NeoInput
              label="Intake Term"
              placeholder="e.g. Fall 2026"
              value={formData.intake_term}
              onChange={(e) => handleChange("intake_term", e.target.value)}
              error={errors.intake_term}
              required
            />

            <NeoInput
              label="Estimated CIBIL Score (Optional)"
              type="number"
              min={300}
              max={900}
              placeholder="e.g. 750"
              value={formData.cibil_score || ""}
              onChange={(e) =>
                handleChange(
                  "cibil_score",
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
              error={errors.cibil_score}
            />
          </div>

          {/* STEM Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 border-2 border-black bg-[#BAE6FD]/30 shadow-[2px_2px_0px_0px_#000000] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.target_stem}
                onChange={(e) => handleChange("target_stem", e.target.checked)}
                className="mt-0.5 h-4 w-4 border-2 border-black accent-black cursor-pointer"
              />
              <div>
                <div className="text-xs font-black text-black uppercase">
                  STEM-Designated Program
                </div>
                <div className="text-[11px] font-bold text-neutral-700">
                  Science, Technology, Engineering, or Math. Many lenders (Prodigy, Avanse) offer specialized collateral-free slabs for STEM degrees.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Footer */}
        <div className="pt-4 border-t-2 border-black flex justify-end">
          <NeoButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
          >
            <span>{isLoading ? "SAVING..." : "SAVE & PROCEED TO STUDY PLAN"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </NeoButton>
        </div>
      </div>
    </form>
  );
}
