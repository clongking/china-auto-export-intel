"use client";

import { DimensionBadge, RiskBadge, SentimentTag } from "@/components/intel/badges";
import { Badge } from "@/components/ui/badge";
import { DIMENSION_ACCENTS, companyName, countryName, formatRelativeTime, regionName } from "@/lib/format";
import type { IntelItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExternalLink, FlaskConical } from "lucide-react";

interface NewsCardProps {
  item: IntelItem;
  onOpen: (item: IntelItem) => void;
  compact?: boolean;
}

export function NewsCard({ item, onOpen, compact = false }: NewsCardProps) {
  const places = item.countryIds.length > 0 ? item.countryIds.map(countryName) : item.regionIds.map(regionName);
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className={cn(
        "group relative flex cursor-pointer gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-all hover:-translate-y-px hover:shadow-md hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        item.risk === "high" && "ring-red-200 dark:ring-red-900/60",
      )}
    >
      <span className={cn("mt-1 h-auto w-1 shrink-0 rounded-full", DIMENSION_ACCENTS[item.dimension])} aria-hidden />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <DimensionBadge id={item.dimension} />
          {item.risk !== "low" && <RiskBadge level={item.risk} />}
          <SentimentTag value={item.sentiment} />
          {item.isSeed && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <FlaskConical /> 示例数据
            </Badge>
          )}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatRelativeTime(item.publishedAt)}</span>
        </div>
        <h3 className={cn("font-semibold leading-snug text-foreground group-hover:underline underline-offset-2", compact ? "text-sm line-clamp-2" : "text-base line-clamp-2")}>
          {item.title}
        </h3>
        {!compact && item.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{item.source}</span>
          {item.companyIds.length > 0 && (
            <span className="truncate">
              企业：{item.companyIds.map(companyName).join(" · ")}
            </span>
          )}
          {places.length > 0 && <span className="truncate">目的地：{places.slice(0, 4).join(" · ")}</span>}
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
          >
            原文 <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
