import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: number | null;
  className?: string;
}

function StatCard({ label, value, icon, trend, className = "" }: StatCardProps) {
  const showTrend = typeof trend === "number";

  return (
    <div
      className={`rounded-2xl px-5 py-4 min-h-28 flex flex-col justify-between shadow-(--shadow-card) ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-500/80">{label}</span>
          <span className="text-3xl font-semibold text-dark-800 leading-none">{value}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/35 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {showTrend && (
        <span
          className={`text-sm font-medium ${
            trend >= 0 ? "text-success" : "text-error"
          }`}
        >
          {trend >= 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
  );
}

export default StatCard;
