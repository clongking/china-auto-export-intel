"use client";

import { DimensionBadge, RiskBadge, SentimentTag } from "@/components/intel/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { companyName, countryName, dimensionName, formatDateTime, regionName } from "@/lib/format";
import { DIMENSIONS } from "@/lib/taxonomy";
import type { IntelItem } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface DetailDialogProps {
  item: IntelItem | null;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function DetailDialog({ item, onClose }: DetailDialogProps) {
  const scores = item
    ? DIMENSIONS.map((d) => ({ id: d.id, name: d.name, score: item.dimensionScores[d.id] ?? 0 })).filter((s) => s.score > 0).sort((a, b) => b.score - a.score)
    : [];
  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {item && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-1.5 pr-6">
                <DimensionBadge id={item.dimension} />
                <RiskBadge level={item.risk} />
                <SentimentTag value={item.sentiment} />
                {item.isSeed && <Badge variant="outline">示例数据</Badge>}
                <Badge variant="outline">{item.language === "zh" ? "中文" : "英文"}</Badge>
              </div>
              <DialogTitle className="text-lg leading-snug">{item.title}</DialogTitle>
              <DialogDescription>
                {item.source} · {formatDateTime(item.publishedAt)}
              </DialogDescription>
            </DialogHeader>

            {item.summary ? (
              <p className="text-sm leading-relaxed text-foreground/90">{item.summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">该来源未提供摘要，请点击下方按钮查看原文。</p>
            )}

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="涉及企业">
                {item.companyIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.companyIds.map((id) => (
                      <Badge key={id} variant="secondary">{companyName(id)}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">未识别到具体企业（中国车企整体相关）</span>
                )}
              </Field>
              <Field label="目的地国家 / 地区">
                {item.countryIds.length > 0 || item.regionIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.countryIds.map((id) => (
                      <Badge key={id} variant="secondary">{countryName(id)}</Badge>
                    ))}
                    {item.regionIds
                      .filter((r) => !item.countryIds.some((c) => c === r))
                      .map((id) => (
                        <Badge key={id} variant="outline">{regionName(id)}</Badge>
                      ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">未识别</span>
                )}
              </Field>
              <Field label="维度得分（规则命中）">
                {scores.length > 0 ? (
                  <ul className="space-y-1">
                    {scores.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2">
                        <span>{s.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{s.score}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">未命中维度关键词，归入「{dimensionName("other")}」</span>
                )}
              </Field>
              <Field label="命中关键词">
                {item.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.matchedKeywords.map((k) => (
                      <code key={k} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{k}</code>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">无</span>
                )}
              </Field>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <span className="self-center text-xs text-muted-foreground">ID {item.id}</span>
              <Button asChild>
                <a href={item.link} target="_blank" rel="noreferrer noopener">
                  查看原文 <ExternalLink />
                </a>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
