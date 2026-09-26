import {
  COMPANIES,
  COUNTRIES,
  DIMENSIONS,
  HIGH_RISK_TERMS,
  NEGATIVE_TERMS,
  POSITIVE_TERMS,
  REGIONS,
} from "./taxonomy";
import type { Classification, DimensionId, RiskLevel, Sentiment } from "./types";

const REGION_ALIASES: Record<string, string[]> = {
  europe: ["europe", "european", "欧洲", "欧盟"],
  sea: ["southeast asia", "asean", "东南亚", "东盟"],
  latam: ["latin america", "south america", "拉美", "拉丁美洲", "南美"],
  mideast: ["middle east", "gulf", "gcc", "中东", "海湾"],
  oceania: ["oceania", "澳洲", "大洋洲"],
  russia: ["central asia", "中亚", "cis", "独联体"],
  namerica: ["north america", "北美"],
  africa: ["africa", "african", "非洲"],
};

const CHINA_TERMS = ["chinese", "china", "中国", "国产", "自主品牌", "中资"];

const LATIN = /[a-z0-9]/i;
const regexCache = new Map<string, RegExp>();

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 拉丁字母别名使用词边界匹配，避免 "nio" 命中 "union" 之类误报；中文直接子串匹配。 */
export function termMatches(text: string, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return false;
  if (!LATIN.test(t)) return text.includes(t);
  let re = regexCache.get(t);
  if (!re) {
    re = new RegExp(`(?<![a-z0-9])${escapeRegex(t)}(?![a-z0-9])`, "i");
    regexCache.set(t, re);
  }
  return re.test(text);
}

function countHits(text: string, terms: string[]): { count: number; hits: string[] } {
  const hits: string[] = [];
  for (const term of terms) if (termMatches(text, term)) hits.push(term);
  return { count: hits.length, hits };
}

export interface ClassifyInput {
  title: string;
  summary?: string;
}

export function classify({ title, summary = "" }: ClassifyInput): Classification {
  const titleText = ` ${title.toLowerCase()} `;
  const bodyText = ` ${summary.toLowerCase()} `;
  const fullText = titleText + bodyText;

  const companyIds = COMPANIES.filter((c) => c.aliases.some((a) => termMatches(fullText, a))).map((c) => c.id);

  const countryIds = COUNTRIES.filter((c) => c.aliases.some((a) => termMatches(fullText, a))).map((c) => c.id);
  const regionSet = new Set<string>();
  for (const id of countryIds) {
    const c = COUNTRIES.find((x) => x.id === id);
    if (c) regionSet.add(c.regionId);
  }
  for (const region of REGIONS) {
    const aliases = REGION_ALIASES[region.id];
    if (aliases && aliases.some((a) => termMatches(fullText, a))) regionSet.add(region.id);
  }

  const dimensionScores: Partial<Record<DimensionId, number>> = {};
  const matched = new Set<string>();
  for (const dim of DIMENSIONS) {
    let score = 0;
    for (const kw of dim.keywords) {
      const w = kw.weight ?? 1;
      if (termMatches(titleText, kw.term)) {
        score += w * 2;
        matched.add(kw.term);
      } else if (termMatches(bodyText, kw.term)) {
        score += w;
        matched.add(kw.term);
      }
    }
    if (score > 0) dimensionScores[dim.id] = score;
  }

  let dimension: DimensionId = "other";
  let best = 0;
  for (const dim of DIMENSIONS) {
    const s = dimensionScores[dim.id] ?? 0;
    if (s > best) {
      best = s;
      dimension = dim.id;
    }
  }

  const pos = countHits(titleText, POSITIVE_TERMS).count * 2 + countHits(bodyText, POSITIVE_TERMS).count;
  const negTitle = countHits(titleText, NEGATIVE_TERMS);
  const negBody = countHits(bodyText, NEGATIVE_TERMS);
  const neg = negTitle.count * 2 + negBody.count;
  let sentiment: Sentiment = "neutral";
  if (neg > pos && neg > 0) sentiment = "negative";
  else if (pos > neg && pos > 0) sentiment = "positive";

  const highRisk = countHits(fullText, HIGH_RISK_TERMS);
  let risk: RiskLevel = "low";
  if (dimension === "policy" && highRisk.count > 0) risk = "high";
  else if (sentiment === "negative" && highRisk.count > 0) risk = "high";
  else if (dimension === "policy" || sentiment === "negative") risk = "medium";

  for (const h of highRisk.hits) matched.add(h);
  for (const h of negTitle.hits) matched.add(h);

  return {
    companyIds,
    countryIds,
    regionIds: [...regionSet],
    dimension,
    dimensionScores,
    sentiment,
    risk,
    matchedKeywords: [...matched].slice(0, 12),
  };
}

const OVERSEAS_TERMS = [
  "export", "exports", "exported", "overseas", "global", "abroad", "international", "worldwide", "foreign market", "right-hand drive",
  "出海", "海外", "出口", "全球", "国际", "右舵", "境外", "跨境",
];

/**
 * 判断一条新闻是否与「中国汽车出海」主题足够相关，值得保留：
 * 识别到企业且（识别到目的地 或 提及出海/出口）；或 政策类且同时提及中国与汽车。
 */
export function isRelevant(c: Classification, text: string): boolean {
  const lower = ` ${text.toLowerCase()} `;
  if (c.companyIds.length > 0) {
    if (c.countryIds.length > 0 || c.regionIds.length > 0) return true;
    return OVERSEAS_TERMS.some((t) => termMatches(lower, t));
  }
  const mentionsChina = CHINA_TERMS.some((t) => termMatches(lower, t));
  const mentionsAuto = ["ev", "evs", "electric vehicle", "electric vehicles", "car", "cars", "auto", "automaker", "automakers", "vehicle", "电动车", "电动汽车", "汽车", "新能源", "车企"].some(
    (t) => termMatches(lower, t),
  );
  return c.dimension === "policy" && mentionsChina && mentionsAuto;
}
