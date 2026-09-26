import { XMLParser } from "fast-xml-parser";
import { classify, isRelevant } from "./classify";
import { COMPANIES, REGIONS } from "./taxonomy";
import type { IntelItem } from "./types";

export interface FeedQuery {
  id: string;
  url: string;
  language: "zh" | "en";
  label: string;
}

const GOOGLE_NEWS_BASE = "https://news.google.com/rss/search";

function googleNewsUrl(q: string, lang: "zh" | "en"): string {
  const params =
    lang === "zh"
      ? new URLSearchParams({ q, hl: "zh-CN", gl: "CN", ceid: "CN:zh-Hans" })
      : new URLSearchParams({ q, hl: "en-US", gl: "US", ceid: "US:en" });
  return `${GOOGLE_NEWS_BASE}?${params.toString()}`;
}

/**
 * 按「企业 × 目的地」以及「政策 × 目的地」构造 Google News RSS 查询。
 * 免密钥；查询数量约 100+，由 fetchAll 控制并发。
 */
export function buildQueries(): FeedQuery[] {
  const queries: FeedQuery[] = [];
  const recent = "when:30d";

  for (const company of COMPANIES) {
    for (const region of REGIONS) {
      queries.push({
        id: `${company.id}:${region.id}:en`,
        url: googleNewsUrl(`${company.queryEn} (${region.queryEn}) ${recent}`, "en"),
        language: "en",
        label: `${company.name} × ${region.name}（英文）`,
      });
    }
    queries.push({
      id: `${company.id}:overseas:zh`,
      url: googleNewsUrl(`${company.queryZh} (出海 OR 海外 OR 出口 OR 欧洲 OR 东南亚 OR 拉美) ${recent}`, "zh"),
      language: "zh",
      label: `${company.name} × 出海（中文）`,
    });
  }

  for (const region of REGIONS) {
    queries.push({
      id: `policy:${region.id}:en`,
      url: googleNewsUrl(`Chinese EV (tariff OR tariffs OR regulation OR probe OR subsidy OR ban) (${region.queryEn}) ${recent}`, "en"),
      language: "en",
      label: `政策 × ${region.name}（英文）`,
    });
    queries.push({
      id: `policy:${region.id}:zh`,
      url: googleNewsUrl(`中国 (电动车 OR 汽车) (关税 OR 反补贴 OR 法规 OR 准入 OR 调查) (${region.queryZh}) ${recent}`, "zh"),
      language: "zh",
      label: `政策 × ${region.name}（中文）`,
    });
  }

  return queries;
}

interface RssItem {
  title?: string;
  link?: string;
  guid?: string | { "#text"?: string };
  pubDate?: string;
  description?: string;
  source?: string | { "#text"?: string; "@_url"?: string };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "__cdata",
  trimValues: true,
});

function textOf(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.__cdata === "string") return o.__cdata;
    if (typeof o["#text"] === "string") return o["#text"] as string;
  }
  return "";
}

const ENTITY_MAP: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'",
};

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#?\w+);/g, (m, e: string) => {
      if (ENTITY_MAP[e] !== undefined) return ENTITY_MAP[e];
      if (e.startsWith("#x")) return String.fromCodePoint(parseInt(e.slice(2), 16));
      if (e.startsWith("#")) return String.fromCodePoint(parseInt(e.slice(1), 10));
      return m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/** Google News 标题形如 "Headline - Source"，去掉尾部来源名。 */
function cleanTitle(title: string, source: string): string {
  const t = stripHtml(title);
  if (source && t.endsWith(` - ${source}`)) return t.slice(0, -(source.length + 3)).trim();
  const idx = t.lastIndexOf(" - ");
  if (idx > 20 && t.length - idx < 40) return t.slice(0, idx).trim();
  return t;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hashString(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function parseFeed(xml: string, language: "zh" | "en"): IntelItem[] {
  const doc = parser.parse(xml) as { rss?: { channel?: { item?: RssItem | RssItem[] } } };
  const rawItems = doc?.rss?.channel?.item;
  if (!rawItems) return [];
  const list = Array.isArray(rawItems) ? rawItems : [rawItems];
  const out: IntelItem[] = [];

  for (const raw of list) {
    const source = textOf(raw.source) || "未知来源";
    const title = cleanTitle(textOf(raw.title), source);
    const link = textOf(raw.link).trim();
    if (!title || !link) continue;
    const descriptionRaw = textOf(raw.description);
    let summary = stripHtml(descriptionRaw);
    // Google News 的 description 通常只是标题+来源的重复，去掉后避免噪声
    if (normalizeTitle(summary).startsWith(normalizeTitle(title).slice(0, 40))) {
      summary = summary.slice(title.length).replace(/^\s*[-–—]?\s*/, "").trim();
      if (summary === source || summary.length < 8) summary = "";
    }
    const published = raw.pubDate ? new Date(raw.pubDate) : new Date();
    const publishedAt = isNaN(published.getTime()) ? new Date().toISOString() : published.toISOString();

    const classification = classify({ title, summary });
    if (!isRelevant(classification, `${title} ${summary}`)) continue;

    out.push({
      id: hashString(normalizeTitle(title)),
      title,
      summary,
      link,
      source,
      publishedAt,
      language,
      ...classification,
    });
  }
  return out;
}

export interface FetchResult {
  items: IntelItem[];
  succeeded: number;
  failed: number;
  errors: string[];
}

const DEFAULT_HEADERS = {
  "user-agent": "Mozilla/5.0 (compatible; ChinaAutoIntelBot/1.0; +https://github.com)",
  accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
};

async function fetchQuery(q: FeedQuery, timeoutMs: number): Promise<IntelItem[]> {
  const res = await fetch(q.url, {
    headers: DEFAULT_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  return parseFeed(xml, q.language);
}

export async function fetchAll(
  queries: FeedQuery[],
  { concurrency = 8, timeoutMs = 12_000 }: { concurrency?: number; timeoutMs?: number } = {},
): Promise<FetchResult> {
  const results: IntelItem[] = [];
  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < queries.length) {
      const q = queries[cursor++];
      try {
        const items = await fetchQuery(q, timeoutMs);
        results.push(...items);
        succeeded++;
      } catch (err) {
        failed++;
        if (errors.length < 10) errors.push(`${q.label}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queries.length) }, worker));
  return { items: dedupe(results), succeeded, failed, errors };
}

/** 按规范化标题 / 链接去重，同一事件保留最早发布的一条并合并识别到的实体。 */
export function dedupe(items: IntelItem[]): IntelItem[] {
  const byKey = new Map<string, IntelItem>();
  const seenLinks = new Set<string>();
  for (const item of items) {
    if (seenLinks.has(item.link)) continue;
    const key = item.id;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...item });
      seenLinks.add(item.link);
      continue;
    }
    existing.companyIds = [...new Set([...existing.companyIds, ...item.companyIds])];
    existing.countryIds = [...new Set([...existing.countryIds, ...item.countryIds])];
    existing.regionIds = [...new Set([...existing.regionIds, ...item.regionIds])];
    if (new Date(item.publishedAt) < new Date(existing.publishedAt)) existing.publishedAt = item.publishedAt;
    if (!existing.summary && item.summary) existing.summary = item.summary;
  }
  return [...byKey.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}
