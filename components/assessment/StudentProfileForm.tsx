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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
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
      <div className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Quick Load Demo Profiles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STUDENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 hover:shadow-sm transition-all text-xs group"
            >
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {preset.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Applicant & University Target</CardTitle>
          <CardDescription>
            Enter your personal contact details and destination institution to trigger country & STEM criteria checks.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section A: Personal Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Priya Sharma"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                error={errors.full_name}
                leftIcon={<User className="h-4 w-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="priya@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
              />

              <Input
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
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Academic Institution
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Destination Country"
                value={formData.target_country}
                onChange={(e) => handleChange("target_country", e.target.value)}
                error={errors.target_country}
                options={[
                  { value: "USA", label: "United States (USA)" },
                  { value: "United Kingdom", label: "United Kingdom (UK)" },
                  { value: "Germany", label: "Germany" },
                  { value: "Canada", label: "Canada" },
                  { value: "Australia", label: "Australia" },
                  { value: "Ireland", label: "Ireland" },
                  { value: "Singapore", label: "Singapore" },
                  { value: "France", label: "France" },
                ]}
                required
              />

              <Input
                label="Target University"
                placeholder="e.g. Carnegie Mellon University"
                value={formData.target_university}
                onChange={(e) => handleChange("target_university", e.target.value)}
                error={errors.target_university}
                leftIcon={<GraduationCap className="h-4 w-4" />}
                required
              />

              <Select
                label="Degree Level"
                value={formData.target_degree}
                onChange={(e) => handleChange("target_degree", e.target.value)}
                error={errors.target_degree}
                options={[
                  { value: "masters", label: "Master's Degree (MS / MBA / MA)" },
                  { value: "bachelors", label: "Bachelor's Degree (BS / BA / B.Tech)" },
                  { value: "doctorate", label: "Doctorate / PhD" },
                  { value: "diploma", label: "Post-Graduate Diploma" },
                ]}
                required
              />

              <Input
                label="Target Course / Major"
                placeholder="e.g. Computer Science"
                value={formData.target_course}
                onChange={(e) => handleChange("target_course", e.target.value)}
                error={errors.target_course}
                leftIcon={<BookOpen className="h-4 w-4" />}
                required
              />

              <Input
                label="Intake Term"
                placeholder="e.g. Fall 2026"
                value={formData.intake_term}
                onChange={(e) => handleChange("intake_term", e.target.value)}
                error={errors.intake_term}
                leftIcon={<Calendar className="h-4 w-4" />}
                required
              />

              <Input
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
                leftIcon={<CreditCard className="h-4 w-4" />}
                helperText="Indian lenders require min 680-700 for prime interest slabs."
              />
            </div>

            {/* STEM Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.target_stem}
                  onChange={(e) => handleChange("target_stem", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0f382c] focus:ring-[#0f382c] accent-[#0f382c]"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    STEM-Designated Program
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Science, Technology, Engineering, or Math. Many international & NBFC lenders (e.g. Prodigy, MPower, Avanse) offer specialized collateral-free slabs for STEM majors.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Save Profile & Proceed to Study Plan
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
