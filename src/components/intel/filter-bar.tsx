"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPANIES, COUNTRIES, REGIONS } from "@/lib/taxonomy";
import { RotateCcw, Search } from "lucide-react";

export type TimeRange = "24h" | "7d" | "30d" | "all";
export type RiskFilter = "all" | "high" | "medium" | "low";
export type LanguageFilter = "all" | "zh" | "en";

export interface Filters {
  query: string;
  company: string;
  /** region:<id> 或 country:<id> 或 all */
  place: string;
  risk: RiskFilter;
  time: TimeRange;
  language: LanguageFilter;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  company: "all",
  place: "all",
  risk: "all",
  time: "30d",
  language: "all",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card/80 p-3 ring-1 ring-foreground/10 backdrop-blur">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="搜索标题、摘要、来源，例如「匈牙利 工厂」或 tariff"
          className="pl-8"
          aria-label="搜索情报"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.company} onValueChange={(v) => set("company", v)}>
          <SelectTrigger className="w-[9.5rem]" aria-label="企业">
            <SelectValue placeholder="全部企业" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部企业</SelectItem>
            <SelectSeparator />
            {COMPANIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.place} onValueChange={(v) => set("place", v)}>
          <SelectTrigger className="w-[10.5rem]" aria-label="目的地">
            <SelectValue placeholder="全部目的地" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value="all">全部目的地</SelectItem>
            {REGIONS.map((r) => (
              <SelectGroup key={r.id}>
                <SelectLabel>{r.name}</SelectLabel>
                <SelectItem value={`region:${r.id}`}>{r.name}（全部）</SelectItem>
                {COUNTRIES.filter((c) => c.regionId === r.id).map((c) => (
                  <SelectItem key={c.id} value={`country:${c.id}`}>　{c.name}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.risk} onValueChange={(v) => set("risk", v as RiskFilter)}>
          <SelectTrigger className="w-[7.5rem]" aria-label="风险级别">
            <SelectValue placeholder="全部风险" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部风险</SelectItem>
            <SelectItem value="high">高风险</SelectItem>
            <SelectItem value="medium">中风险</SelectItem>
            <SelectItem value="low">低风险</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.time} onValueChange={(v) => set("time", v as TimeRange)}>
          <SelectTrigger className="w-[7.5rem]" aria-label="时间范围">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">近 24 小时</SelectItem>
            <SelectItem value="7d">近 7 天</SelectItem>
            <SelectItem value="30d">近 30 天</SelectItem>
            <SelectItem value="all">全部时间</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.language} onValueChange={(v) => set("language", v as LanguageFilter)}>
          <SelectTrigger className="w-[7rem]" aria-label="语言">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">中英文</SelectItem>
            <SelectItem value="zh">仅中文</SelectItem>
            <SelectItem value="en">仅英文</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">共 {resultCount} 条</span>
          {dirty && (
            <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
              <RotateCcw /> 重置
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
