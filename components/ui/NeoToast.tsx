"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Check, AlertTriangle, X, Info } from "lucide-react";
import { NeoBadge } from "./NeoPrimitives";

type ToastType = "success" | "warning" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const bgClass = {
            success: "bg-[#86EFAC]",
            warning: "bg-[#FEF08A]",
            error: "bg-[#F472B6]",
            info: "bg-[#BAE6FD]",
          }[t.type];

          const Icon = {
            success: Check,
            warning: AlertTriangle,
            error: AlertTriangle,
            info: Info,
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto neo-box p-3.5 ${bgClass} flex items-start justify-between gap-3 shadow-[4px_4px_0px_0px_#000000] animate-in slide-in-from-bottom-3 duration-150`}
            >
              <div className="flex items-start gap-2.5">
                <div className="border-2 border-black bg-white p-1 mt-0.5">
                  <Icon className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div>
                  <div className="font-black text-xs uppercase tracking-tight text-black">
                    {t.title}
                  </div>
                  {t.message && (
                    <div className="text-[11px] font-bold text-neutral-800 mt-0.5">{t.message}</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="border-2 border-black bg-white p-0.5 hover:bg-neutral-100 cursor-pointer shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useNeoToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useNeoToast must be used within ToastProvider");
  }
  return context;
}
