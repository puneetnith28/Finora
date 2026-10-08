"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api/client";

interface HealthState {
  backend: "checking" | "healthy" | "unhealthy";
  database: "checking" | "healthy" | "unhealthy";
  details?: Record<string, unknown>;
}

export const HealthStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthState>({
    backend: "checking",
    database: "checking",
  });

  useEffect(() => {
    async function checkHealth() {
      try {
        const backendHealth = await api.get<{ status: string }>("/health");
        const dbHealth = await api.get<{ status: string; database: string }>("/health/db");

        setHealth({
          backend: backendHealth.status === "healthy" ? "healthy" : "unhealthy",
          database: dbHealth.status === "healthy" ? "healthy" : "unhealthy",
          details: { ...backendHealth, ...dbHealth },
        });
      } catch {
        setHealth({
          backend: "unhealthy",
          database: "unhealthy",
        });
      }
    }

    checkHealth();
  }, []);

  return (
    <div className="flex items-center gap-3 text-xs font-mono px-3 py-1.5 rounded-full border bg-neutral-900/50 backdrop-blur border-neutral-800 text-neutral-300">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            health.backend === "healthy"
              ? "bg-emerald-400 animate-pulse"
              : health.backend === "checking"
              ? "bg-amber-400 animate-pulse"
              : "bg-rose-500"
          }`}
        />
        <span>API: {health.backend}</span>
      </div>
      <span className="text-neutral-700">|</span>
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            health.database === "healthy"
              ? "bg-emerald-400 animate-pulse"
              : health.database === "checking"
              ? "bg-amber-400 animate-pulse"
              : "bg-rose-500"
          }`}
        />
        <span>DB: {health.database}</span>
      </div>
    </div>
  );
};
