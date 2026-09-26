import { Dashboard } from "@/components/intel/dashboard";
import { COMPANIES, REGIONS } from "@/lib/taxonomy";
import { Radar } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-foreground/10 bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
              <Radar className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">中国汽车出海情报探测系统</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                聚合 {COMPANIES.length} 家出海车企在 {REGIONS.length} 大目的地区域的公开新闻，自动识别企业、国家、情报维度与政策风险。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            {COMPANIES.map((c) => (
              <span key={c.id} className="rounded-full bg-muted px-2 py-0.5">{c.name}</span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <Dashboard />
      </main>

      <footer className="border-t border-foreground/10 py-4 text-center text-xs text-muted-foreground">
        数据来源：Google News RSS 公开搜索结果（中英文）。情报仅用于行业研究参考，原文版权归各媒体所有。
      </footer>
    </div>
  );
}
