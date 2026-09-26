"use client";

import { RiskBadge } from "@/components/intel/badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { companyName, countryName, formatRelativeTime, regionName } from "@/lib/format";
import type { IntelItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Gavel, ShieldAlert } from "lucide-react";

interface PolicyPanelProps {
  items: IntelItem[];
  onOpen: (item: IntelItem) => void;
  onShowAll: () => void;
}

export function PolicyPanel({ items, onOpen, onShowAll }: PolicyPanelProps) {
  const policyItems = items
    .filter((i) => i.dimension === "policy" || i.risk === "high")
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      const r = riskOrder[a.risk] - riskOrder[b.risk];
      if (r !== 0) return r;
      return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    });
  const highCount = policyItems.filter((i) => i.risk === "high").length;

  return (
    <Card className="border-rose-200/70 bg-gradient-to-b from-rose-50/80 to-card ring-rose-200/70 dark:from-rose-950/30 dark:ring-rose-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gavel className="size-4 text-rose-700" />
          政策 / 政治规则专栏
        </CardTitle>
        <CardDescription>
          关税、反补贴、准入法规与本地化要求。当前 {policyItems.length} 条，其中 <span className="font-semibold text-red-700 dark:text-red-300">{highCount}</span> 条高风险。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {policyItems.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            当前筛选范围内暂无政策类事件。
          </div>
        ) : (
          policyItems.slice(0, 8).map((item) => {
            const places = item.countryIds.length > 0 ? item.countryIds.map(countryName) : item.regionIds.map(regionName);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item)}
                className={cn(
                  "w-full rounded-lg bg-card/90 p-3 text-left ring-1 ring-foreground/10 transition-colors hover:bg-card hover:ring-foreground/25",
                  item.risk === "high" && "ring-red-300/80 dark:ring-red-800",
                )}
              >
                <div className="flex items-center gap-2">
                  {item.risk === "high" && <ShieldAlert className="size-4 shrink-0 text-red-600" />}
                  <RiskBadge level={item.risk} />
                  <span className="ml-auto text-xs text-muted-foreground">{formatRelativeTime(item.publishedAt)}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {[places.slice(0, 3).join(" · "), item.companyIds.slice(0, 3).map(companyName).join(" · ")].filter(Boolean).join(" ｜ ") || item.source}
                </p>
              </button>
            );
          })
        )}
        {policyItems.length > 8 && (
          <button type="button" onClick={onShowAll} className="w-full pt-1 text-center text-xs font-medium text-rose-700 hover:underline dark:text-rose-300">
            查看全部 {policyItems.length} 条政策事件 →
          </button>
        )}
      </CardContent>
    </Card>
  );
}
