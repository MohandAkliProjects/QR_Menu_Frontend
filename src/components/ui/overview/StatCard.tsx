import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: number | null;
  className?: string;
}

function StatCard({ label, value, icon, trend, className = "" }: StatCardProps) {
  const showTrend = typeof trend === "number";

  const trendColor = trend === 0
    ? "text-text-400"
    : trend! > 0
    ? "text-success"
    : "text-error";

  const TrendIcon = trend === 0 ? Minus : trend! > 0 ? TrendingUp : TrendingDown;
  const trendLabel = trend === 0
    ? "No change vs last month"
    : trend! > 0
    ? `+${trend}% vs last month`
    : `${trend}% vs last month`;

  return (
    <div
      className={`
        rounded-2xl px-5 py-4 min-h-28 flex flex-col justify-between
        shadow-(--shadow-card) cursor-default
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg hover:brightness-105
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-500/80">{label}</span>
          <span className="text-3xl font-semibold text-dark-800 leading-none">{value}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/35 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>

      {showTrend && (
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;