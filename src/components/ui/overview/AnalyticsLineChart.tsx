import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyViewSeries } from "../../../lib/analytics";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface AnalyticsLineChartProps {
  title: string;
  series: DailyViewSeries[];
  primaryKey?: "total" | "qrCode" | "direct";
  secondaryKey?: "qrCode" | "direct";
  primaryDefaultVisible?: boolean;
  secondaryDefaultVisible?: boolean;
  showSecondaryToggle?: boolean;
  emptyMessage?: string;
  month: { year: number; month: number };
  onPrev: () => void;
  onNext: () => void;
}

const PRIMARY_COLOR = "#60A5FA";
const SECONDARY_COLOR = "#4ADE80";

const KEY_LABELS: Record<string, string> = {
  total: "Total",
  qrCode: "QR Code",
  direct: "Direct",
};

interface TooltipEntry {
  dataKey?: string | number;
  color?: string;
  value?: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-white/50 mb-1">Day {label}</p>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/80">
            {KEY_LABELS[String(entry.dataKey)] ?? String(entry.dataKey)}:
          </span>
          <span className="text-white font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsLineChart({
  title,
  series,
  primaryKey = "total",
  secondaryKey = "direct",
  primaryDefaultVisible = true,
  secondaryDefaultVisible = true,
  showSecondaryToggle = true,
  emptyMessage = "No data available yet.",
  month,
  onPrev,
  onNext,
}: AnalyticsLineChartProps) {
  const now = new Date();
  const isCurrentMonth =
    month.year === now.getFullYear() && month.month === now.getMonth();

  const [showPrimary, setShowPrimary] = useState(primaryDefaultVisible);
  const [showSecondary, setShowSecondary] = useState(secondaryDefaultVisible);

  const [yZoom, setYZoom] = useState(1);
  const chartRef = useRef<HTMLDivElement>(null);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setYZoom((prev) => {
      const delta = e.deltaY > 0 ? 1.15 : 0.87;
      return Math.min(4, Math.max(0.2, prev * delta));
    });
  }

  const hasData =
    series.some((p) => p[primaryKey] > 0) ||
    series.some((p) => p[secondaryKey] > 0);

  const rawMax = Math.max(
    ...series.map((p) => Math.max(p[primaryKey], p[secondaryKey])),
    1
  );
  const yMax = Math.ceil(rawMax * yZoom);

  const ticks = series
    .filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === series.length - 1)
    .map((p) => p.label);

  return (
    <div className="rounded-2xl bg-[#1c1c1c] p-5 flex flex-col gap-4 min-h-96">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrimary((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border transition-all ${
                showPrimary
                  ? "border-[#60A5FA]/40 text-[#60A5FA]"
                  : "border-white/10 text-white/30"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: showPrimary ? PRIMARY_COLOR : "rgba(255,255,255,0.15)" }}
              />
              {KEY_LABELS[primaryKey]}
            </button>

            {showSecondaryToggle && (
              <button
                onClick={() => setShowSecondary((v) => !v)}
                className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border transition-all ${
                  showSecondary
                    ? "border-[#4ADE80]/40 text-[#4ADE80]"
                    : "border-white/10 text-white/30"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: showSecondary ? SECONDARY_COLOR : "rgba(255,255,255,0.15)" }}
                />
                {KEY_LABELS[secondaryKey]}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/60 min-w-28 text-center">
            {MONTH_NAMES[month.month]} {month.year}
          </span>
          <button
            onClick={onNext}
            disabled={isCurrentMonth}
            className="text-white/50 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-[10px] text-white/25 -mt-2">
        Scroll on chart to zoom Y-axis
      </p>

      {hasData ? (
        <div
          ref={chartRef}
          className="flex-1 w-full"
          onWheel={handleWheel}
          style={{ touchAction: "none" }}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-primary-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`grad-secondary-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SECONDARY_COLOR} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={SECONDARY_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                ticks={ticks}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, yMax]}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDataOverflow
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              />

              {showSecondary && (
                <Area
                  type="monotone"
                  dataKey={secondaryKey}
                  stroke={SECONDARY_COLOR}
                  strokeWidth={2}
                  fill={`url(#grad-secondary-${title})`}
                  dot={false}
                  activeDot={{ r: 4, fill: SECONDARY_COLOR, strokeWidth: 0 }}
                  isAnimationActive={true}
                />
              )}

              {showPrimary && (
                <Area
                  type="monotone"
                  dataKey={primaryKey}
                  stroke={PRIMARY_COLOR}
                  strokeWidth={2}
                  fill={`url(#grad-primary-${title})`}
                  dot={false}
                  activeDot={{ r: 4, fill: PRIMARY_COLOR, strokeWidth: 0 }}
                  isAnimationActive={true}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-white/40 text-center px-4">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export default AnalyticsLineChart;