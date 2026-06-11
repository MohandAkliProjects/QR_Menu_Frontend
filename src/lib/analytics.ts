import type { MenuView } from "../types";

export interface MonthlyViewSeries {
  label: string;
  qrCode: number;
  direct: number;
  total: number;
}

export interface DailyViewSeries {
  label: string;
  qrCode: number;
  direct: number;
  total: number;
}

const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}


export function buildMonthlyViewSeries(views: MenuView[]): MonthlyViewSeries[] {
  const now = new Date();
  const buckets = new Map<string, MonthlyViewSeries>();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(monthKey(d), {
      label: MONTH_LABELS[d.getMonth()],
      qrCode: 0,
      direct: 0,
      total: 0,
    });
  }

  for (const v of views) {
    const d = new Date(v.viewedAt);
    if (Number.isNaN(d.getTime())) continue;

    const bucket = buckets.get(monthKey(d));
    if (!bucket) continue;

    if (v.typeOfView === "QR_CODE") bucket.qrCode++;
    else if (v.typeOfView === "DIRECT") bucket.direct++;

    bucket.total++;
  }

  return Array.from(buckets.values());
}


export function buildDailyViewSeries(
  views: MenuView[],
  year: number,
  month: number
): DailyViewSeries[] {
  const days = new Date(year, month + 1, 0).getDate();
  const buckets = new Map<string, DailyViewSeries>();

  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    buckets.set(dayKey(d), {
      label: String(i),
      qrCode: 0,
      direct: 0,
      total: 0,
    });
  }

  for (const v of views) {
    const d = new Date(v.viewedAt);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;

    const bucket = buckets.get(dayKey(d));
    if (!bucket) continue;

    if (v.typeOfView === "QR_CODE") bucket.qrCode++;
    else if (v.typeOfView === "DIRECT") bucket.direct++;

    bucket.total++;
  }

  return Array.from(buckets.values());
}


export function calculateViewsTrend(views: MenuView[]): number | null {
  const now = new Date();

  const currentY = now.getFullYear();
  const currentM = now.getMonth();

  const prevDate = new Date(currentY, currentM - 1, 1);
  const prevY = prevDate.getFullYear();
  const prevM = prevDate.getMonth();

  let current = 0;
  let previous = 0;

  for (const v of views) {
    const d = new Date(v.viewedAt);
    if (Number.isNaN(d.getTime())) continue;

    if (d.getFullYear() === currentY && d.getMonth() === currentM) current++;
    else if (d.getFullYear() === prevY && d.getMonth() === prevM) previous++;
  }

  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function calculateLikesTrend(likes: { likedAt: string }[]): number | null {
  const now = new Date();

  const curY = now.getFullYear();
  const curM = now.getMonth();

  const prev = new Date(curY, curM - 1, 1);

  let current = 0;
  let previous = 0;

  for (const l of likes) {
    const d = new Date(l.likedAt);
    if (Number.isNaN(d.getTime())) continue;

    if (d.getFullYear() === curY && d.getMonth() === curM) current++;
    else if (d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth()) previous++;
  }

  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}


export function formatStatNumber(v: number): string {
  return new Intl.NumberFormat().format(v);
}


export function buildDailyLikesSeries(
  likes: { likedAt: string }[],
  year: number,
  month: number
): DailyViewSeries[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const buckets = new Map<string, DailyViewSeries>();

  const key = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    buckets.set(key(d), {
      label: String(day),
      qrCode: 0,
      direct: 0,
      total: 0,
    });
  }

  for (const l of likes) {
    const d = new Date(l.likedAt);
    if (Number.isNaN(d.getTime())) continue;

    if (d.getFullYear() !== year || d.getMonth() !== month) continue;

    const bucket = buckets.get(key(d));
    if (bucket) bucket.total++;
  }

  return Array.from(buckets.values());
}

export function formatDisplayDate(value?: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function resolveSubscriptionBanner(
  subscriptionEndDate?: string
): "warning" | "success" | null {
  if (!subscriptionEndDate) return null;

  const end = new Date(subscriptionEndDate);
  if (Number.isNaN(end.getTime())) return null;

  const now = new Date();

  const daysLeft = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) return "warning";
  if (daysLeft <= 14) return "warning";
  if (daysLeft >= 365) return "success";

  return null;
}