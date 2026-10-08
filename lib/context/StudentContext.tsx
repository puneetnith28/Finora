"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  const [activeStudentId, setActiveStudentIdState] = useState<number | null>(null);
  const [activeStudentName, setActiveStudentNameState] = useState<string | null>(null);
  const [activeAssessmentId, setActiveAssessmentIdState] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY_STUDENT_ID);
      const storedName = localStorage.getItem(STORAGE_KEY_STUDENT_NAME);
      const storedAssessmentId = localStorage.getItem(STORAGE_KEY_ASSESSMENT_ID);

      if (storedId) {
        const parsed = parseInt(storedId, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setActiveStudentIdState(parsed);
        }
      } else {
        // Default initial session demo student ID if none saved
        setActiveStudentIdState(1);
      }

      if (storedName) {
        setActiveStudentNameState(storedName);
      }

      if (storedAssessmentId) {
        const parsed = parseInt(storedAssessmentId, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setActiveAssessmentIdState(parsed);
        }
      }
    } catch {
      // LocalStorage access fallback
      setActiveStudentIdState(1);
    } finally {
      setIsHydrated(true);
    }
  }, []);

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
