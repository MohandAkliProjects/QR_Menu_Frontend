import type { MenuView } from "../types";

export interface MonthlyViewSeries {
  label: string;
  qrCode: number;
  direct: number;
  total: number;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function buildMonthlyViewSeries(views: MenuView[]): MonthlyViewSeries[] {
  const now = new Date();
  const buckets = new Map<string, MonthlyViewSeries>();

  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = monthKey(date);
    buckets.set(key, {
      label: MONTH_LABELS[date.getMonth()],
      qrCode: 0,
      direct: 0,
      total: 0,
    });
  }

  for (const view of views) {
    const viewedAt = new Date(view.viewedAt);
    if (Number.isNaN(viewedAt.getTime())) continue;

    const key = monthKey(viewedAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    if (view.typeOfView === "QR_CODE") {
      bucket.qrCode += 1;
    } else if (view.typeOfView === "DIRECT") {
      bucket.direct += 1;
    }

    bucket.total += 1;
  }

  return Array.from(buckets.values());
}

export function calculateViewsTrend(views: MenuView[]): number | null {
  const series = buildMonthlyViewSeries(views);
  if (series.length < 2) return null;

  const current = series[series.length - 1]?.total ?? 0;
  const previous = series[series.length - 2]?.total ?? 0;

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export function formatStatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export type SubscriptionBannerVariant = "warning" | "success" | null;

export function resolveSubscriptionBanner(
  subscriptionEndDate?: string
): SubscriptionBannerVariant {
  if (!subscriptionEndDate) return null;

  const endDate = new Date(subscriptionEndDate);
  if (Number.isNaN(endDate.getTime())) return null;

  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return "warning";
  if (daysUntilExpiry <= 14) return "warning";
  if (daysUntilExpiry >= 365) return "success";

  return null;
}

export function formatDisplayDate(value?: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
