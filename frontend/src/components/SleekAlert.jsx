import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export function SleekAlert({ type, message }) {
  if (!message) return null;
  const isError = type === "error";

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
      isError 
        ? "bg-red-500/5 border-red-500/10 text-red-400" 
        : "bg-green-500/5 border-green-500/10 text-green-400"
    }`}>
      {isError ? (
        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
      )}
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
