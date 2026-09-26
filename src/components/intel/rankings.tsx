"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { companyName, countryName } from "@/lib/format";
import type { IntelItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Building2, Globe2 } from "lucide-react";

interface RankingsProps {
  items: IntelItem[];
  onSelectCountry: (id: string) => void;
  onSelectCompany: (id: string) => void;
  activeCountry?: string;
  activeCompany?: string;
}

function tally(items: IntelItem[], pick: (i: IntelItem) => string[]): { id: string; count: number; high: number }[] {
  const map = new Map<string, { count: number; high: number }>();
  for (const item of items) {
    for (const id of pick(item)) {
      const e = map.get(id) ?? { count: 0, high: 0 };
      e.count++;
      if (item.risk === "high") e.high++;
      map.set(id, e);
    }
  }
  return [...map.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count);
}

export function Rankings({ items, onSelectCountry, onSelectCompany, activeCountry, activeCompany }: RankingsProps) {
  const countries = tally(items, (i) => i.countryIds).slice(0, 8);
  const companies = tally(items, (i) => i.companyIds).slice(0, 9);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <RankCard
        icon={<Globe2 className="size-4 text-sky-700" />}
        title="热点目的地"
        description="按情报数量排序，红色为高风险占比"
        rows={countries.map((c) => ({ ...c, label: countryName(c.id), active: activeCountry === c.id }))}
        onSelect={onSelectCountry}
        empty="当前范围内未识别到目的地国家。"
      />
      <RankCard
        icon={<Building2 className="size-4 text-violet-700" />}
        title="活跃企业"
        description="当前筛选范围内被提及最多的出海企业"
        rows={companies.map((c) => ({ ...c, label: companyName(c.id), active: activeCompany === c.id }))}
        onSelect={onSelectCompany}
        empty="当前范围内未识别到企业。"
      />
    </div>
  );
}

interface RankRow {
  id: string;
  label: string;
  count: number;
  high: number;
  active: boolean;
}

function RankCard({ icon, title, description, rows, onSelect, empty }: { icon: React.ReactNode; title: string; description: string; rows: RankRow[]; onSelect: (id: string) => void; empty: string }) {
  const max = rows[0]?.count ?? 1;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelect(row.id)}
                  className={cn("group w-full rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted", row.active && "bg-muted")}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn("font-medium", row.active && "underline underline-offset-2")}>{row.label}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {row.high > 0 && <span className="mr-1.5 text-red-600">{row.high} 高风险</span>}
                      {row.count}
                    </span>
                  </div>
                  <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-red-500" style={{ width: `${(row.high / max) * 100}%` }} />
                    <div className="h-full bg-foreground/60" style={{ width: `${((row.count - row.high) / max) * 100}%` }} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
