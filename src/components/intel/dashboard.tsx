"use client";

import { DetailDialog } from "@/components/intel/detail-dialog";
import { DEFAULT_FILTERS, FilterBar, type Filters } from "@/components/intel/filter-bar";
import { NewsCard } from "@/components/intel/news-card";
import { PolicyPanel } from "@/components/intel/policy-panel";
import { Rankings } from "@/components/intel/rankings";
import { StatsOverview } from "@/components/intel/stats-overview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, dimensionName } from "@/lib/format";
import { intelDataUrl, isIntelPayload } from "@/lib/intel-data";
import { COUNTRY_MAP, DIMENSIONS } from "@/lib/taxonomy";
import type { DimensionId, IntelItem, IntelMeta, IntelPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, Database, FlaskConical, Radio, RefreshCw, SearchX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 30;
const POLL_INTERVAL_MS = 5 * 60_000;

type LoadState = "loading" | "ready" | "error";

const TIME_WINDOWS: Record<Filters["time"], number | null> = {
  "24h": 24 * 3_600_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
  all: null,
};

function applyFilters(items: IntelItem[], f: Filters, dimension: DimensionId | "all", now: number): IntelItem[] {
  const window = TIME_WINDOWS[f.time];
  const q = f.query.trim().toLowerCase();
  const [placeKind, placeId] = f.place === "all" ? ["all", ""] : f.place.split(":");
  return items.filter((item) => {
    if (window !== null && now - new Date(item.publishedAt).getTime() > window) return false;
    if (dimension !== "all" && item.dimension !== dimension) return false;
    if (f.company !== "all" && !item.companyIds.includes(f.company)) return false;
    if (placeKind === "country" && !item.countryIds.includes(placeId)) return false;
    if (placeKind === "region" && !item.regionIds.includes(placeId)) return false;
    if (f.risk !== "all" && item.risk !== f.risk) return false;
    if (f.language !== "all" && item.language !== f.language) return false;
    if (q) {
      const hay = `${item.title} ${item.summary} ${item.source}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function Dashboard() {
  const [payload, setPayload] = useState<IntelPayload | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNote, setRefreshNote] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [dimension, setDimension] = useState<DimensionId | "all">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<IntelItem | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`${intelDataUrl()}?t=${Date.now()}`, { cache: "no-store", signal });
    if (!res.ok) {
      throw new Error(res.status === 404 ? "数据文件尚未生成（本地请先运行 npm run fetch）" : `数据文件加载失败：HTTP ${res.status}`);
    }
    const data: unknown = await res.json();
    if (!isIntelPayload(data)) throw new Error("数据文件格式不正确");
    setPayload(data);
    setNow(Date.now());
    setState("ready");
    setError(null);
    return data;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initial = Promise.resolve().then(() => load(controller.signal));
    initial.catch((err: unknown) => {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "加载失败");
      setState("error");
    });
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      load().catch(() => {
        /* 后台轮询失败时保留现有数据 */
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshNote(null);
    const previousUpdatedAt = payload?.meta.updatedAt ?? null;
    try {
      const latest = await load();
      setRefreshNote(
        latest.meta.updatedAt && latest.meta.updatedAt !== previousUpdatedAt
          ? `已加载最新数据（${formatDateTime(latest.meta.updatedAt)}）`
          : "已重新加载，数据暂无更新；抓取由 GitHub Actions 每小时执行一次",
      );
    } catch (err) {
      setRefreshNote(`刷新失败：${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setRefreshing(false);
    }
  };

  const baseItems = useMemo(() => applyFilters(payload?.items ?? [], filters, "all", now), [payload, filters, now]);
  const filtered = useMemo(() => (dimension === "all" ? baseItems : baseItems.filter((i) => i.dimension === dimension)), [baseItems, dimension]);

  const updateFilters = (next: Filters) => {
    setFilters(next);
    setVisible(PAGE_SIZE);
  };
  const updateDimension = (next: DimensionId | "all") => {
    setDimension(next);
    setVisible(PAGE_SIZE);
  };
  const activeCountry = filters.place.startsWith("country:") ? filters.place.slice(8) : undefined;

  return (
    <div className="space-y-5">
      <StatusBar meta={payload?.meta ?? null} state={state} refreshing={refreshing} onRefresh={handleRefresh} note={refreshNote} />

      {state === "loading" && <LoadingSkeleton />}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-red-300 bg-red-50/60 p-10 text-center dark:bg-red-950/20">
          <AlertCircle className="size-8 text-red-600" />
          <div>
            <p className="font-semibold">情报服务暂时不可用</p>
            <p className="mt-1 text-sm text-muted-foreground">{error ?? "未知错误"}</p>
          </div>
          <Button
            onClick={() => {
              setState("loading");
              load().catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "加载失败");
                setState("error");
              });
            }}
          >
            <RefreshCw /> 重试
          </Button>
        </div>
      )}

      {state === "ready" && (
        <>
          <StatsOverview items={baseItems} activeDimension={dimension} onSelectDimension={updateDimension} />

          <FilterBar filters={filters} onChange={updateFilters} resultCount={filtered.length} />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Tabs value={dimension} onValueChange={(v) => updateDimension(v as DimensionId | "all")}>
                  <TabsList className="h-auto flex-wrap">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    {DIMENSIONS.map((d) => (
                      <TabsTrigger key={d.id} value={d.id}>{dimensionName(d.id)}</TabsTrigger>
                    ))}
                    <TabsTrigger value="other">综合</TabsTrigger>
                  </TabsList>
                </Tabs>
                <span className="text-xs text-muted-foreground">按发布时间倒序 · 已去重</span>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  onReset={() => {
                    setFilters(DEFAULT_FILTERS);
                    updateDimension("all");
                  }}
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {filtered.slice(0, visible).map((item) => (
                      <NewsCard key={item.id} item={item} onOpen={setSelected} />
                    ))}
                  </div>
                  {visible < filtered.length && (
                    <div className="flex justify-center pt-2">
                      <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                        加载更多（剩余 {filtered.length - visible} 条）
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>

            <aside className="space-y-4">
              <PolicyPanel
                items={baseItems}
                onOpen={setSelected}
                onShowAll={() => {
                  updateDimension("policy");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <Rankings
                items={filtered}
                activeCountry={activeCountry}
                activeCompany={filters.company === "all" ? undefined : filters.company}
                onSelectCountry={(id) =>
                  updateFilters({ ...filters, place: activeCountry === id ? "all" : `country:${id}` })
                }
                onSelectCompany={(id) => updateFilters({ ...filters, company: filters.company === id ? "all" : id })}
              />
              <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                目的地识别覆盖 {COUNTRY_MAP.size} 个国家 / 地区。分类基于可扩展的关键词规则，不依赖付费模型 API；详情面板可查看每条情报的命中关键词与维度得分。
              </p>
            </aside>
          </div>
        </>
      )}

      <DetailDialog item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function StatusBar({ meta, state, refreshing, onRefresh, note }: { meta: IntelMeta | null; state: LoadState; refreshing: boolean; onRefresh: () => void; note: string | null }) {
  const source = meta?.dataSource;
  const sourceBadge =
    source === "live" ? (
      <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"><Radio /> 定时抓取</Badge>
    ) : source === "cache" ? (
      <Badge className="border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200"><Database /> 上次成功抓取</Badge>
    ) : source === "seed" ? (
      <Badge className="border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"><FlaskConical /> 示例数据</Badge>
    ) : (
      <Badge variant="outline">连接中…</Badge>
    );

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card/70 px-4 py-3 ring-1 ring-foreground/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {sourceBadge}
        {meta && (
          <>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              最近更新 {formatDateTime(meta.updatedAt)}
            </span>
            {meta.totalQueries > 0 && (
              <span className="inline-flex items-center gap-1">
                {meta.failedQueries === 0 ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <AlertCircle className="size-3.5 text-amber-600" />}
                {meta.succeededQueries}/{meta.totalQueries} 个 RSS 查询成功
              </span>
            )}
            <span>
              数据每{meta.refreshIntervalMinutes === 60 ? "小时" : ` ${meta.refreshIntervalMinutes} 分钟`}由 GitHub Actions 自动抓取并重新发布
            </span>
            {meta.dataSource === "seed" && <span className="text-amber-700 dark:text-amber-300">上次抓取失败或无结果，正在展示内置示例数据</span>}
            {meta.lastError && meta.dataSource !== "seed" && <span className="text-amber-700 dark:text-amber-300">{meta.lastError}</span>}
          </>
        )}
        {state === "loading" && <span>正在加载情报…</span>}
      </div>
      <div className="flex items-center gap-2">
        {note && <span className={cn("hidden text-xs text-muted-foreground md:inline", note.startsWith("刷新失败") && "text-red-600")}>{note}</span>}
        <Button size="sm" variant="outline" onClick={onRefresh} disabled={refreshing || state === "loading"} title="重新读取最新发布的数据文件">
          <RefreshCw className={cn(refreshing && "animate-spin")} />
          {refreshing ? "加载中…" : "重新加载"}
        </Button>
      </div>
      {note && <span className={cn("text-xs text-muted-foreground md:hidden", note.startsWith("刷新失败") && "text-red-600")}>{note}</span>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-label="加载中">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
      <SearchX className="size-8 text-muted-foreground" />
      <div>
        <p className="font-semibold">没有符合条件的情报</p>
        <p className="mt-1 text-sm text-muted-foreground">试试放宽时间范围、切换维度，或清空搜索关键词。</p>
      </div>
      <Button variant="outline" onClick={onReset}>重置全部筛选</Button>
    </div>
  );
}
