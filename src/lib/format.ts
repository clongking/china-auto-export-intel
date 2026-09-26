import { COMPANY_MAP, COUNTRY_MAP, DIMENSION_LABELS, REGION_MAP } from "./taxonomy";
import type { DimensionId, RiskLevel, Sentiment } from "./types";

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.round(months / 12)} 年前`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function companyName(id: string): string {
  return COMPANY_MAP.get(id)?.name ?? id;
}

export function countryName(id: string): string {
  return COUNTRY_MAP.get(id)?.name ?? id;
}

export function regionName(id: string): string {
  return REGION_MAP.get(id)?.name ?? id;
}

export function dimensionName(id: DimensionId): string {
  return DIMENSION_LABELS[id] ?? id;
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: "利好",
  neutral: "中性",
  negative: "利空",
};

export const DIMENSION_STYLES: Record<DimensionId, string> = {
  launch: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  sales: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  production: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  strategy: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  policy: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  other: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
};

export const DIMENSION_ACCENTS: Record<DimensionId, string> = {
  launch: "bg-sky-500",
  sales: "bg-emerald-500",
  production: "bg-amber-500",
  strategy: "bg-violet-500",
  policy: "bg-rose-500",
  other: "bg-neutral-400",
};

export const RISK_STYLES: Record<RiskLevel, string> = {
  high: "bg-red-600 text-white",
  medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

export const SENTIMENT_STYLES: Record<Sentiment, string> = {
  positive: "text-emerald-700 dark:text-emerald-300",
  neutral: "text-neutral-500",
  negative: "text-red-700 dark:text-red-300",
};
