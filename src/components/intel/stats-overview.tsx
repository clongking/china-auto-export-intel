"use client";

import { Card } from "@/components/ui/card";
import { DIMENSION_ACCENTS, dimensionName } from "@/lib/format";
import { DIMENSIONS } from "@/lib/taxonomy";
import type { DimensionId, IntelItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Newspaper } from "lucide-react";

interface StatsOverviewProps {
  items: IntelItem[];
  activeDimension: DimensionId | "all";
  onSelectDimension: (id: DimensionId | "all") => void;
}

export function StatsOverview({ items, activeDimension, onSelectDimension }: StatsOverviewProps) {
  const counts = new Map<DimensionId, number>();
  let highRisk = 0;
  for (const item of items) {
    counts.set(item.dimension, (counts.get(item.dimension) ?? 0) + 1);
    if (item.risk === "high") highRisk++;
  }
  const total = items.length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
      <StatTile
        label="情报总数"
        value={total}
        icon={<Newspaper className="size-4 text-muted-foreground" />}
        active={activeDimension === "all"}
        onClick={() => onSelectDimension("all")}
        accent="bg-foreground"
      />
      <StatTile
        label="高风险事件"
        value={highRisk}
        icon={<AlertTriangle className="size-4 text-red-600" />}
        accent="bg-red-600"
        tone="danger"
      />
      {DIMENSIONS.map((d) => (
        <StatTile
          key={d.id}
          label={dimensionName(d.id)}
          value={counts.get(d.id) ?? 0}
          hint={total > 0 ? `${Math.round(((counts.get(d.id) ?? 0) / total) * 100)}%` : undefined}
          accent={DIMENSION_ACCENTS[d.id]}
          active={activeDimension === d.id}
          onClick={() => onSelectDimension(activeDimension === d.id ? "all" : d.id)}
        />
      ))}
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: number;
  hint?: string;
  icon?: React.ReactNode;
  accent: string;
  active?: boolean;
  tone?: "default" | "danger";
  onClick?: () => void;
}

function StatTile({ label, value, hint, icon, accent, active, tone = "default", onClick }: StatTileProps) {
  const interactive = typeof onClick === "function";
  return (
    <Card
      size="sm"
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "relative gap-1 px-3 transition-all",
        interactive && "cursor-pointer hover:-translate-y-px hover:shadow-md hover:ring-foreground/20",
        active && "ring-2 ring-foreground/70",
        tone === "danger" && value > 0 && "bg-red-50/70 dark:bg-red-950/30",
      )}
    >
      <span className={cn("absolute top-3 left-0 h-6 w-1 rounded-r", accent)} aria-hidden />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-2xl font-semibold tabular-nums", tone === "danger" && value > 0 && "text-red-700 dark:text-red-300")}>{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
