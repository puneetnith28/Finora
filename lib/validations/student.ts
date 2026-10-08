import { z } from "zod";

export const studentSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().default(""),
  citizenship: z.string().min(2, "Citizenship is required").default("India"),
  target_country: z.string().min(2, "Destination country is required"),
  target_university: z.string().min(2, "University name is required"),
  target_degree: z.string().min(2, "Target degree level is required"),
  target_course: z.string().min(2, "Course or specialization name is required"),
  target_stem: z.boolean().default(true),
  intake_term: z.string().min(2, "Intake term is required"),
  cibil_score: z
    .number()
    .min(300, "CIBIL score must be between 300 and 900")
    .max(900, "CIBIL score must be between 300 and 900")
    .optional()
    .nullable(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

export interface StudentPreset {
  id: string;
  name: string;
  subtitle: string;
  data: StudentFormData;
}

export const STUDENT_PRESETS: StudentPreset[] = [
  {
    id: "stem-us",
    name: "Priya Sharma",
    subtitle: "MS CS at Carnegie Mellon University (USA)",
    data: {
      full_name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 98765 43210",
      citizenship: "India",
      target_country: "USA",
      target_university: "Carnegie Mellon University",
      target_degree: "masters",
      target_course: "Master of Science in Computer Science",
      target_stem: true,
      intake_term: "Fall 2026",
      cibil_score: 760,
    },
  },
  {
    id: "stem-germany",
    name: "Rahul Verma",
    subtitle: "MS Data Engineering at TU Munich (Germany)",
    data: {
      full_name: "Rahul Verma",
      email: "rahul.verma@example.com",
      phone: "+91 98111 22334",
      citizenship: "India",
      target_country: "Germany",
      target_university: "Technical University of Munich",
      target_degree: "masters",
      target_course: "M.Sc. Data Engineering & Analytics",
      target_stem: true,
      intake_term: "Winter 2026",
      cibil_score: 720,
    },
  },
  {
    id: "mba-uk",
    name: "Ananya Iyer",
    subtitle: "MBA at London Business School (UK)",
    data: {
      full_name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      phone: "+91 99000 88776",
      citizenship: "India",
      target_country: "United Kingdom",
      target_university: "London Business School",
      target_degree: "masters",
      target_course: "Full-Time MBA",
      target_stem: false,
      intake_term: "Fall 2026",
      cibil_score: 780,
    },
  },
];
