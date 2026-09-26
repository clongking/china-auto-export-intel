/**
 * 抓取 Google News RSS、规则分类并输出静态数据文件 public/data/intel.json。
 *
 *   npx tsx scripts/fetch-intel.ts               # 完整抓取，失败时回退到内置示例数据
 *   npx tsx scripts/fetch-intel.ts --if-missing  # 仅在数据文件不存在时写入示例数据（不联网）
 *   npx tsx scripts/fetch-intel.ts --seed        # 直接写入示例数据（不联网）
 *
 * 该脚本永远以退出码 0 结束，避免拖垮 GitHub Actions 的部署流程。
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildQueries, fetchAll } from "../src/lib/collector";
import { INTEL_DATA_FILE, REFRESH_INTERVAL_MINUTES } from "../src/lib/intel-data";
import { getSeedItems } from "../src/lib/seed";
import type { DataSource, IntelItem, IntelMeta, IntelPayload } from "../src/lib/types";

const OUTPUT = path.join(process.cwd(), "public", INTEL_DATA_FILE);
const MAX_ITEMS = 1500;
const MIN_LIVE_ITEMS = 5;

interface Stats {
  totalQueries: number;
  succeededQueries: number;
  failedQueries: number;
  rawItems: number;
}

function buildPayload(items: IntelItem[], dataSource: DataSource, stats: Stats, lastError: string | null): IntelPayload {
  const updatedAt = new Date().toISOString();
  const meta: IntelMeta = {
    updatedAt,
    dataSource,
    ...stats,
    keptItems: items.length,
    refreshIntervalMinutes: REFRESH_INTERVAL_MINUTES,
    nextRefreshAt: new Date(Date.now() + REFRESH_INTERVAL_MINUTES * 60_000).toISOString(),
    refreshing: false,
    lastError,
  };
  return { items, meta };
}

function seedPayload(lastError: string | null): IntelPayload {
  return buildPayload(getSeedItems(), "seed", { totalQueries: 0, succeededQueries: 0, failedQueries: 0, rawItems: 0 }, lastError);
}

async function readExisting(): Promise<IntelPayload | null> {
  try {
    const parsed = JSON.parse(await readFile(OUTPUT, "utf8")) as IntelPayload;
    return Array.isArray(parsed.items) && parsed.items.length >= MIN_LIVE_ITEMS && parsed.meta?.dataSource !== "seed" ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchLive(): Promise<IntelPayload> {
  const queries = buildQueries();
  console.log(`[fetch-intel] 开始抓取 ${queries.length} 个 RSS 查询…`);
  const started = Date.now();
  const result = await fetchAll(queries);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`[fetch-intel] 完成：成功 ${result.succeeded}，失败 ${result.failed}，去重后 ${result.items.length} 条，耗时 ${seconds}s`);
  for (const err of result.errors) console.warn(`[fetch-intel]   - ${err}`);

  if (result.items.length < MIN_LIVE_ITEMS) {
    throw new Error(`抓取结果过少（${result.items.length} 条，${result.failed} 个查询失败）${result.errors[0] ? "：" + result.errors[0] : ""}`);
  }
  const lastError = result.failed > 0 ? `${result.failed}/${queries.length} 个查询失败：${result.errors[0] ?? ""}` : null;
  return buildPayload(
    result.items.slice(0, MAX_ITEMS),
    "live",
    { totalQueries: queries.length, succeededQueries: result.succeeded, failedQueries: result.failed, rawItems: result.items.length },
    lastError,
  );
}

async function write(payload: IntelPayload) {
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(payload), "utf8");
  console.log(`[fetch-intel] 已写入 ${path.relative(process.cwd(), OUTPUT)}：${payload.items.length} 条，来源 ${payload.meta.dataSource}，时间 ${payload.meta.updatedAt}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has("--if-missing")) {
    if (existsSync(OUTPUT)) {
      console.log(`[fetch-intel] ${path.relative(process.cwd(), OUTPUT)} 已存在，跳过`);
      return;
    }
    await write(seedPayload(null));
    return;
  }
  if (args.has("--seed")) {
    await write(seedPayload(null));
    return;
  }

  try {
    await write(await fetchLive());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[fetch-intel] 抓取失败：${message}`);
    const previous = await readExisting();
    if (previous) {
      // 保留上一次成功抓取的数据（例如本地缓存），仅更新错误信息
      console.warn("[fetch-intel] 回退到已有数据文件");
      await write({ ...previous, meta: { ...previous.meta, dataSource: "cache", lastError: message, refreshing: false } });
    } else {
      console.warn("[fetch-intel] 回退到内置示例数据");
      await write(seedPayload(message));
    }
  }
}

main().catch((err) => {
  console.error("[fetch-intel] 未预期的错误：", err);
  process.exitCode = 0;
});
