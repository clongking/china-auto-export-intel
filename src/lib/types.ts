export type DimensionId =
  | "launch"
  | "sales"
  | "production"
  | "strategy"
  | "policy"
  | "other";

export type Sentiment = "positive" | "neutral" | "negative";
export type RiskLevel = "high" | "medium" | "low";
export type DataSource = "live" | "cache" | "seed";

export interface Company {
  id: string;
  name: string;
  nameEn: string;
  /** 用于识别的别名（含子品牌），大小写不敏感 */
  aliases: string[];
  /** 构造查询时使用的搜索词 */
  queryEn: string;
  queryZh: string;
}

export interface Region {
  id: string;
  name: string;
  nameEn: string;
  queryEn: string;
  queryZh: string;
}

export interface Country {
  id: string;
  name: string;
  nameEn: string;
  regionId: string;
  aliases: string[];
}

export interface Dimension {
  id: DimensionId;
  name: string;
  description: string;
  keywords: { term: string; weight?: number }[];
}

export interface Classification {
  companyIds: string[];
  countryIds: string[];
  regionIds: string[];
  dimension: DimensionId;
  dimensionScores: Partial<Record<DimensionId, number>>;
  sentiment: Sentiment;
  risk: RiskLevel;
  matchedKeywords: string[];
}

export interface IntelItem extends Classification {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  publishedAt: string;
  language: "zh" | "en";
  isSeed?: boolean;
}

export interface IntelMeta {
  updatedAt: string | null;
  dataSource: DataSource;
  totalQueries: number;
  succeededQueries: number;
  failedQueries: number;
  rawItems: number;
  keptItems: number;
  refreshIntervalMinutes: number;
  nextRefreshAt: string | null;
  refreshing: boolean;
  lastError: string | null;
}

export interface IntelPayload {
  items: IntelItem[];
  meta: IntelMeta;
}
