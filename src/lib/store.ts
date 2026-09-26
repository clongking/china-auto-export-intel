import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildQueries, fetchAll } from "./collector";
import { getSeedItems } from "./seed";
import type { DataSource, IntelItem, IntelMeta, IntelPayload } from "./types";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "intel.json");
const REFRESH_INTERVAL_MINUTES = Math.max(5, Number(process.env.INTEL_REFRESH_MINUTES ?? 30));
const MAX_ITEMS = 1500;
const MIN_LIVE_ITEMS = 5;

interface CacheFile {
  updatedAt: string;
  items: IntelItem[];
  stats: Pick<IntelMeta, "totalQueries" | "succeededQueries" | "failedQueries" | "rawItems">;
}

interface StoreState {
  items: IntelItem[];
  dataSource: DataSource;
  updatedAt: string | null;
  stats: CacheFile["stats"];
  refreshing: Promise<IntelPayload> | null;
  lastError: string | null;
  lastAttemptAt: number;
  timer: ReturnType<typeof setInterval> | null;
  loadedFromDisk: boolean;
}

const g = globalThis as unknown as { __intelStore?: StoreState };

function state(): StoreState {
  if (!g.__intelStore) {
    g.__intelStore = {
      items: [],
      dataSource: "seed",
      updatedAt: null,
      stats: { totalQueries: 0, succeededQueries: 0, failedQueries: 0, rawItems: 0 },
      refreshing: null,
      lastError: null,
      lastAttemptAt: 0,
      timer: null,
      loadedFromDisk: false,
    };
  }
  return g.__intelStore;
}

async function loadDiskCache(s: StoreState) {
  if (s.loadedFromDisk) return;
  s.loadedFromDisk = true;
  try {
    const raw = await readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as CacheFile;
    if (Array.isArray(parsed.items) && parsed.items.length >= MIN_LIVE_ITEMS) {
      s.items = parsed.items;
      s.updatedAt = parsed.updatedAt;
      s.stats = parsed.stats;
      s.dataSource = "cache";
    }
  } catch {
    // 无缓存文件属于正常情况
  }
}

async function saveDiskCache(file: CacheFile) {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(file), "utf8");
  } catch (err) {
    console.warn("[intel] 写入缓存失败:", err);
  }
}

function buildMeta(s: StoreState): IntelMeta {
  const next = s.updatedAt ? new Date(new Date(s.updatedAt).getTime() + REFRESH_INTERVAL_MINUTES * 60_000) : null;
  return {
    updatedAt: s.updatedAt,
    dataSource: s.dataSource,
    totalQueries: s.stats.totalQueries,
    succeededQueries: s.stats.succeededQueries,
    failedQueries: s.stats.failedQueries,
    rawItems: s.stats.rawItems,
    keptItems: s.items.length,
    refreshIntervalMinutes: REFRESH_INTERVAL_MINUTES,
    nextRefreshAt: next ? next.toISOString() : null,
    refreshing: s.refreshing !== null,
    lastError: s.lastError,
  };
}

function payload(s: StoreState): IntelPayload {
  const items = s.items.length >= MIN_LIVE_ITEMS ? s.items : getSeedItems();
  return { items, meta: { ...buildMeta(s), dataSource: s.items.length >= MIN_LIVE_ITEMS ? s.dataSource : "seed", keptItems: items.length } };
}

function isStale(s: StoreState): boolean {
  if (!s.updatedAt) return true;
  return Date.now() - new Date(s.updatedAt).getTime() > REFRESH_INTERVAL_MINUTES * 60_000;
}

async function doRefresh(s: StoreState): Promise<IntelPayload> {
  const queries = buildQueries();
  s.lastAttemptAt = Date.now();
  try {
    const result = await fetchAll(queries);
    if (result.items.length >= MIN_LIVE_ITEMS) {
      s.items = result.items.slice(0, MAX_ITEMS);
      s.updatedAt = new Date().toISOString();
      s.dataSource = "live";
      s.stats = {
        totalQueries: queries.length,
        succeededQueries: result.succeeded,
        failedQueries: result.failed,
        rawItems: result.items.length,
      };
      s.lastError = result.failed > 0 ? `${result.failed}/${queries.length} 个查询失败：${result.errors[0] ?? ""}` : null;
      await saveDiskCache({ updatedAt: s.updatedAt, items: s.items, stats: s.stats });
    } else {
      s.lastError = `抓取结果过少（${result.items.length} 条，${result.failed} 个查询失败）${result.errors[0] ? "：" + result.errors[0] : ""}`;
      if (s.items.length > 0) s.dataSource = "cache";
    }
  } catch (err) {
    s.lastError = err instanceof Error ? err.message : String(err);
    if (s.items.length > 0) s.dataSource = "cache";
  }
  return payload(s);
}

function ensureScheduler(s: StoreState) {
  if (s.timer) return;
  s.timer = setInterval(() => {
    void refreshIntel({ force: true });
  }, REFRESH_INTERVAL_MINUTES * 60_000);
  if (typeof s.timer.unref === "function") s.timer.unref();
}

/**
 * 强制刷新（或等待正在进行的刷新）。
 * 多个并发请求共享同一个刷新 Promise，避免重复打爆上游。
 */
export async function refreshIntel({ force = false }: { force?: boolean } = {}): Promise<IntelPayload> {
  const s = state();
  await loadDiskCache(s);
  ensureScheduler(s);
  if (s.refreshing) return s.refreshing;
  // 距上次尝试不足 60 秒且非强制时直接返回，防止手动刷新被滥用
  if (!force && Date.now() - s.lastAttemptAt < 60_000) return payload(s);
  s.refreshing = doRefresh(s).finally(() => {
    s.refreshing = null;
  });
  return s.refreshing;
}

/**
 * 读取情报：优先返回内存 / 磁盘缓存；缓存过期时在后台触发刷新，
 * 首次无任何缓存时同步等待一次抓取，失败则回退到种子数据。
 */
export async function getIntel(): Promise<IntelPayload> {
  const s = state();
  await loadDiskCache(s);
  ensureScheduler(s);

  if (s.items.length === 0) {
    return refreshIntel({ force: true });
  }
  if (isStale(s) && !s.refreshing) {
    void refreshIntel({ force: true });
  }
  return payload(s);
}
