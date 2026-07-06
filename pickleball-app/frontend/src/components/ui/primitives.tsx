import type { InputHTMLAttributes, ReactNode } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${props.className || ""}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>{children}</div>;
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1">{children}</label>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-red-600 mt-1">{children}</p>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${toneClasses[tone]}`}>{children}</span>;
}
