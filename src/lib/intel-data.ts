import type { IntelPayload } from "./types";

/** 静态数据文件相对于站点根（含 basePath）的路径，由 scripts/fetch-intel.ts 生成。 */
export const INTEL_DATA_FILE = "data/intel.json";

/** GitHub Actions 定时抓取的间隔（分钟），与 .github/workflows/deploy-pages.yml 的 cron 保持一致。 */
export const REFRESH_INTERVAL_MINUTES = 60;

export function basePath(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
}

export function intelDataUrl(): string {
  return `${basePath()}/${INTEL_DATA_FILE}`;
}

export function isIntelPayload(value: unknown): value is IntelPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<IntelPayload>;
  return Array.isArray(v.items) && !!v.meta && typeof v.meta === "object";
}
