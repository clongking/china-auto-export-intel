import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DIMENSION_STYLES,
  RISK_LABELS,
  RISK_STYLES,
  SENTIMENT_LABELS,
  SENTIMENT_STYLES,
  dimensionName,
} from "@/lib/format";
import type { DimensionId, RiskLevel, Sentiment } from "@/lib/types";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function DimensionBadge({ id, className }: { id: DimensionId; className?: string }) {
  return (
    <Badge className={cn("border-transparent font-medium", DIMENSION_STYLES[id], className)}>
      {dimensionName(id)}
    </Badge>
  );
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <Badge className={cn("border-transparent font-medium", RISK_STYLES[level], className)}>
      {level === "high" && <AlertTriangle />}
      {RISK_LABELS[level]}
    </Badge>
  );
}

export function SentimentTag({ value, className }: { value: Sentiment; className?: string }) {
  const Icon = value === "positive" ? ArrowUpRight : value === "negative" ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", SENTIMENT_STYLES[value], className)}>
      <Icon className="size-3.5" />
      {SENTIMENT_LABELS[value]}
    </span>
  );
}
