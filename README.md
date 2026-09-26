# 中国汽车出海情报探测系统

**在线地址：<https://clongking.github.io/china-auto-export-intel/>**（GitHub Pages，数据每小时由 GitHub Actions 自动抓取并重新发布）

聚合比亚迪、奇瑞、上汽 MG、长城、吉利、长安、蔚来、小鹏、零跑等中国车企在欧洲、东南亚、拉美、墨西哥、中东、澳洲、俄罗斯等出海目的地的公开新闻，基于关键词规则自动识别**企业、目的地国家、情报维度、情感与风险级别**，以中文情报看板呈现。

情报维度：新品发布 · 销量 · 生产/建厂 · 战略/合作 · 政治规则/政策（关税、反补贴、本地化要求、准入法规等）。

## 功能

- **数据采集**：按「企业 × 目的地区域」和「政策 × 目的地区域」构造约 120 条 Google News RSS 查询（中英文，免密钥），由 `scripts/fetch-intel.ts` 并发抓取、分类、去重后输出静态文件 `public/data/intel.json`（含生成时间与查询成功率）。抓取失败时自动回退到上一次成功发布的数据或内置示例数据，界面不会空白。
- **自动分类与结构化**：`src/lib/taxonomy.ts` 中的可扩展词表（企业别名与子品牌、国家/地区别名、维度关键词及权重、正负面词、高风险词）驱动 `src/lib/classify.ts` 的规则引擎；无需付费 LLM API。
- **情报看板**：统计概览（各维度数量、高风险事件数）、按企业/目的地/维度/风险/时间/语言筛选与全文搜索、热点目的地与活跃企业排行、政策/政治规则专栏突出高风险事件。
- **详情与去重**：详情弹窗展示摘要、识别到的实体、维度得分与命中关键词，并提供原文链接；按规范化标题 + 链接去重并合并实体。

## 技术栈

Next.js 16（App Router，`output: "export"` 静态导出）· TypeScript · Tailwind CSS v4 · shadcn/ui · fast-xml-parser · tsx。无服务端、无数据库、无鉴权，可托管在任何静态文件服务上。

## 架构与数据更新机制

GitHub Pages 只能托管静态文件，浏览器直接抓取 RSS 会被 CORS 拦截，因此抓取与分类放在构建阶段完成：

```
GitHub Actions（push 到 main / 每小时 cron / 手动触发）
  ├─ 下载上一次发布的 data/intel.json 作为回退
  ├─ npm run fetch      → scripts/fetch-intel.ts 抓取 119 条 RSS、分类、去重 → public/data/intel.json
  ├─ npm run build      → next build 静态导出到 out/（basePath = /china-auto-export-intel）
  └─ 部署 out/ 到 GitHub Pages
```

- 工作流文件：`.github/workflows/deploy-pages.yml`，Pages 的 Source 需设为 **GitHub Actions**。
- 数据每小时更新一次（整点 UTC）；页面顶部状态栏显示「最近更新」时间和 RSS 查询成功率，「重新加载」按钮重新读取最新发布的数据文件。
- 抓取脚本永远以退出码 0 结束：结果过少或网络失败时，优先沿用上一次成功发布的数据（标记为「上次成功抓取」），否则使用内置示例数据（标记为「示例数据」），不会让部署失败。

## 本地运行

```bash
npm install
npm run fetch      # 抓取并生成 public/data/intel.json（约 5 秒，需能访问 news.google.com）
npm run dev        # http://localhost:41730
```

静态构建与预览（模拟 GitHub Pages 的子路径）：

```bash
npm run fetch
NEXT_PUBLIC_BASE_PATH=/china-auto-export-intel npm run build   # 输出到 out/
npx serve out                                                  # 或任何静态文件服务器
```

其他脚本：`npm run fetch -- --seed` 仅写入示例数据（不联网）；`npm run typecheck`、`npm run lint`。

可选环境变量：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | 空 | 站点子路径。GitHub Pages 项目站点需设为 `/china-auto-export-intel`；本地开发留空。 |

## 目录结构

```
.github/workflows/deploy-pages.yml   # 定时抓取 + 构建 + 部署到 GitHub Pages
scripts/
  fetch-intel.ts             # 抓取 / 分类 / 去重，输出 public/data/intel.json（含回退逻辑）
public/data/intel.json       # 生成的静态数据（已 gitignore）
src/
  app/page.tsx               # 页面骨架
  components/intel/          # 看板组件（统计、筛选、新闻卡片、政策专栏、排行、详情）
  lib/
    taxonomy.ts              # 企业 / 国家 / 维度 / 情感 / 风险词表（扩展入口）
    classify.ts              # 规则分类引擎
    collector.ts             # 查询构造、RSS 抓取解析、去重
    intel-data.ts            # 静态数据路径、basePath、更新间隔常量
    seed.ts                  # 兜底示例数据
```

## 分类规则说明

- **企业**：别名（含子品牌，如腾势、Omoda、极氪、哈弗、深蓝）命中即打标，拉丁字母别名使用词边界匹配避免误报。
- **目的地**：国家别名（含主要城市、机构如「欧委会」）命中即打标，并归并到所属区域。
- **维度**：对每个维度的关键词加权求和（标题命中权重 ×2），取最高分；无命中归入「综合」。
- **情感**：正负面词计数比较（标题 ×2）。
- **风险**：政策维度且命中高风险词（关税、反补贴、禁令、制裁、调查、本地化率等）为**高风险**；政策维度或负面情感为中风险；其余为低风险。
- **相关性过滤**：识别到企业且（识别到目的地或提及出海/出口）保留；或政策类且同时提及「中国」与「汽车」保留。

## 已知限制

- Google News RSS 的 `description` 多为标题重复，摘要通常为空，分类以标题为主。
- 规则分类存在一定误判，「综合」类占比约 25%；可通过扩展 `taxonomy.ts` 词表持续优化。
- RSS 链接为 Google News 跳转链接，点击后重定向至原文。
- 数据为静态快照，最快每小时更新一次，无法在页面上实时触发抓取；GitHub Actions 的 `schedule` 在高峰期可能延迟数分钟到数十分钟。
- 抓取依赖 GitHub Actions 运行环境访问 Google News；若被限流，当次发布会沿用上一次成功的数据。
