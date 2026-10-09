"use client";

import React, { createContext, useContext, useState } from "react";

interface StudentContextType {
  activeStudentId: number | null;
  setActiveStudentId: (id: number | null) => void;
  activeStudentName: string | null;
  setActiveStudentName: (name: string | null) => void;
  activeAssessmentId: number | null;
  setActiveAssessmentId: (id: number | null) => void;
}

const StudentContext = createContext<StudentContextType>({
  activeStudentId: null,
  setActiveStudentId: () => {},
  activeStudentName: null,
  setActiveStudentName: () => {},
  activeAssessmentId: null,
  setActiveAssessmentId: () => {},
});

const STORAGE_KEY_STUDENT_ID = "finora_active_student_id";
const STORAGE_KEY_STUDENT_NAME = "finora_active_student_name";
const STORAGE_KEY_ASSESSMENT_ID = "finora_active_assessment_id";

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [activeStudentId, setActiveStudentIdState] = useState<number | null>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const storedId = localStorage.getItem(STORAGE_KEY_STUDENT_ID);
      if (storedId) {
        const parsed = parseInt(storedId, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return 1;
  });

  const [activeStudentName, setActiveStudentNameState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEY_STUDENT_NAME);
    } catch {
      return null;
    }
  });

  const [activeAssessmentId, setActiveAssessmentIdState] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ASSESSMENT_ID);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const setActiveStudentId = (id: number | null) => {
    setActiveStudentIdState(id);
    try {
      if (id !== null) {
        localStorage.setItem(STORAGE_KEY_STUDENT_ID, id.toString());
      } else {
        localStorage.removeItem(STORAGE_KEY_STUDENT_ID);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const setActiveStudentName = (name: string | null) => {
    setActiveStudentNameState(name);
    try {
      if (name !== null) {
        localStorage.setItem(STORAGE_KEY_STUDENT_NAME, name);
      } else {
        localStorage.removeItem(STORAGE_KEY_STUDENT_NAME);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const setActiveAssessmentId = (id: number | null) => {
    setActiveAssessmentIdState(id);
    try {
      if (id !== null) {
        localStorage.setItem(STORAGE_KEY_ASSESSMENT_ID, id.toString());
      } else {
        localStorage.removeItem(STORAGE_KEY_ASSESSMENT_ID);
      }
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <StudentContext.Provider
      value={{
        activeStudentId,
        setActiveStudentId,
        activeStudentName,
        setActiveStudentName,
        activeAssessmentId,
        setActiveAssessmentId,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  return useContext(StudentContext);
}
