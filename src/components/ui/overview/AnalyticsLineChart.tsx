import type { MonthlyViewSeries } from "../../../lib/analytics";

interface AnalyticsLineChartProps {
  title: string;
  series: MonthlyViewSeries[];
  primaryKey?: "total" | "qrCode" | "direct";
  secondaryKey?: "qrCode" | "direct";
  emptyMessage?: string;
}

function buildPath(values: number[], width: number, height: number, maxValue: number): string {
  if (values.length === 0) return "";

  const stepX = values.length > 1 ? width / (values.length - 1) : width / 2;

  return values
    .map((value, index) => {
      const x = index * stepX;
      const normalized = maxValue > 0 ? value / maxValue : 0;
      const y = height - normalized * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function AnalyticsLineChart({
  title,
  series,
  primaryKey = "total",
  secondaryKey = "direct",
  emptyMessage = "No data available yet.",
}: AnalyticsLineChartProps) {
  const primaryValues = series.map((point) => point[primaryKey]);
  const secondaryValues = series.map((point) => point[secondaryKey]);
  const maxValue = Math.max(...primaryValues, ...secondaryValues, 1);
  const hasData = primaryValues.some((value) => value > 0) || secondaryValues.some((value) => value > 0);

  const width = 320;
  const height = 120;
  const primaryPath = buildPath(primaryValues, width, height, maxValue);
  const secondaryPath = buildPath(secondaryValues, width, height, maxValue);

  return (
    <div className="rounded-2xl bg-[#222222] p-5 flex flex-col gap-4 min-h-[260px]">
      <h3 className="text-base font-semibold text-white">{title}</h3>

      {hasData ? (
        <>
          <div className="relative flex-1">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-[140px]"
              preserveAspectRatio="none"
              role="img"
              aria-label={`${title} chart`}
            >
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  x2={width}
                  y1={height * ratio}
                  y2={height * ratio}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              ))}
              <path d={secondaryPath} fill="none" stroke="#4ADE80" strokeWidth="2.5" />
              <path d={primaryPath} fill="none" stroke="#60A5FA" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-white/70">
            {series.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-white/60 text-center px-4">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export default AnalyticsLineChart;
