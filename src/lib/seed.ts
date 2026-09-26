import { classify } from "./classify";
import { dedupe } from "./collector";
import type { IntelItem } from "./types";

interface SeedRow {
  title: string;
  summary: string;
  source: string;
  daysAgo: number;
  language?: "zh" | "en";
}

/**
 * 外网抓取失败时的兜底示例数据。内容为基于公开报道整理的示例性描述，
 * 链接指向 Google News 对该标题的搜索页，方便核实原始来源。
 */
const SEED_ROWS: SeedRow[] = [
  { title: "欧盟对华电动汽车反补贴税进入第二年，比亚迪、吉利、上汽税率维持不变", summary: "欧盟委员会确认对中国产纯电动车征收的反补贴税继续执行，比亚迪 17%、吉利 18.8%、上汽 35.3% 的税率不变，双方仍在就价格承诺机制进行磋商。", source: "路透社", daysAgo: 1 },
  { title: "BYD Hungary plant to begin mass production, first Dolphin Surf rolls off the line in Szeged", summary: "BYD's first European passenger car factory in Szeged, Hungary starts series production with an initial capacity of 150,000 units per year, aiming to avoid EU tariffs through local manufacturing.", source: "Reuters", daysAgo: 1, language: "en" },
  { title: "奇瑞西班牙巴塞罗那工厂下线首批 Omoda 5，欧洲本地化生产提速", summary: "奇瑞与西班牙 EV Motors 合资的巴塞罗那工厂（原日产工厂）正式投产，首批 Omoda 5 燃油版下线，未来将导入 Jaecoo 7 及新能源车型。", source: "第一财经", daysAgo: 2 },
  { title: "MG4 becomes UK's best-selling electric hatchback as SAIC brand posts record September registrations", summary: "SAIC-owned MG Motor UK reported its strongest month on record with registrations up 28% year-on-year, led by the MG4 and the new MGS5 EV.", source: "Autocar", daysAgo: 2, language: "en" },
  { title: "墨西哥拟对中国进口汽车加征最高 50% 关税，比亚迪、奇瑞在墨销售或受冲击", summary: "墨西哥经济部向国会提交对非自贸协定国家进口汽车加征关税的方案，中国品牌车型税率最高提升至 50%，分析认为这与美墨加协定复审前的政治压力有关。", source: "财新网", daysAgo: 3 },
  { title: "Brazil raises EV import tariff to 35%, BYD accelerates Camaçari factory to localize production", summary: "Brazil completed the final step of its phased electric vehicle import tariff increase. BYD says its Bahia complex will assemble Dolphin Mini and Song Plus locally starting this quarter.", source: "Bloomberg", daysAgo: 3, language: "en" },
  { title: "零跑与 Stellantis 合资公司在波兰启动 T03 本地组装，首批车型供应欧洲市场", summary: "Leapmotor International 宣布位于波兰蒂黑的 Stellantis 工厂开始组装零跑 T03，初期年产能约 3 万辆，是中国新势力首个欧洲本地化生产项目。", source: "36氪", daysAgo: 4 },
  { title: "长城汽车泰国罗勇工厂新增哈弗 H6 混动产线，东南亚产能扩至 8 万辆", summary: "长城汽车宣布罗勇工厂完成二期扩建，新增哈弗 H6 HEV 和欧拉好猫产线，同时启动面向东盟市场右舵车型出口。", source: "汽车之家", daysAgo: 4 },
  { title: "Turkey imposes new local content and homologation rules on Chinese EV imports", summary: "Turkey's trade ministry published a regulation requiring Chinese automakers to meet additional type approval and after-sales service network requirements, following an earlier 40% additional duty on Chinese-built cars.", source: "Bloomberg", daysAgo: 5, language: "en" },
  { title: "小鹏与大众签署电子电气架构技术合作扩展协议，加速欧洲市场布局", summary: "小鹏汽车宣布与大众汽车集团深化合作，联合开发的 CEA 架构将应用于大众在华及部分海外车型，同时小鹏 G6、G9 在德国、法国的经销网络扩至 60 家。", source: "界面新闻", daysAgo: 5 },
  { title: "蔚来第三品牌萤火虫欧洲上市定价 3 万欧元起，首批交付挪威和荷兰", summary: "蔚来 Firefly 品牌在欧洲开启预售，采用经销商合作模式而非直营，首批市场为挪威、荷兰，后续进入比利时、丹麦等国。", source: "新浪财经", daysAgo: 6 },
  { title: "Chery's Jaecoo 7 PHEV launches in Australia with 90km electric range, priced from A$47,990", summary: "Chery's premium sub-brand Jaecoo introduced the J7 SHS plug-in hybrid in Australia, targeting the Toyota RAV4 hybrid with a sharper price and seven-year warranty.", source: "Drive.com.au", daysAgo: 6, language: "en" },
  { title: "印尼延长中国电动车进口免税政策至 2026 年底，要求承诺本地化生产", summary: "印尼投资部表示，比亚迪、奇瑞、广汽等已承诺在印尼建厂的企业可继续享受整车进口免税及豪华品税减免，本地化率目标为 40%。", source: "证券时报", daysAgo: 7 },
  { title: "BYD overtakes Tesla in European BEV sales for third straight month, ACEA data shows", summary: "BYD registered more battery-electric vehicles than Tesla across the EU, EFTA and UK, with volumes up 190% year-on-year as the Chinese brand expands its dealer footprint.", source: "Financial Times", daysAgo: 8, language: "en" },
  { title: "长安汽车泰国罗勇工厂正式投产，深蓝 S07 右舵版下线", summary: "长安汽车首个海外整车基地在泰国罗勇府投产，初期年产能 10 万辆，将生产深蓝 S07 及长安启源系列，面向东南亚、澳新市场出口。", source: "澎湃新闻", daysAgo: 9 },
  { title: "Russia raises vehicle recycling fee again, Chinese brands Chery and Haval face price hikes", summary: "Russia's latest increase in the utilisation fee on imported vehicles pushes up prices of Chinese-built cars by up to 10%, as Moscow pressures automakers to localize production.", source: "Reuters", daysAgo: 10, language: "en" },
  { title: "吉利极氪与领克合并后首次欧洲亮相，极氪 7X 慕尼黑车展开启欧洲预售", summary: "极氪科技集团在 IAA 慕尼黑车展公布 7X 欧洲售价，并宣布领克 08 EM-P 进入德国市场，年底前欧洲门店数量将达到 100 家。", source: "新京报", daysAgo: 11 },
  { title: "Canada to review 100% surtax on Chinese EVs amid trade talks with Beijing", summary: "Ottawa signalled it may revisit the 100% tariff on Chinese-made electric vehicles as part of broader trade negotiations, drawing objections from Canadian auto unions.", source: "The Globe and Mail", daysAgo: 12, language: "en" },
  { title: "上汽 MG 在墨西哥销量突破 10 万辆，宣布启动本地建厂选址", summary: "MG Motor 墨西哥累计销量突破 10 万辆，成为增长最快的品牌之一。上汽表示正在新莱昂州与瓜纳华托州之间评估建厂方案。", source: "每日经济新闻", daysAgo: 13 },
  { title: "Saudi Arabia's PIF signs agreement with Geely to explore local EV assembly in King Abdullah Economic City", summary: "Geely and Saudi Arabia's Public Investment Fund signed a memorandum of understanding covering local assembly, charging infrastructure and fleet supply for Riyadh's ride-hailing market.", source: "Arab News", daysAgo: 14, language: "en" },
  { title: "比亚迪巴西工厂遭劳工部门调查，涉及承包商用工条件问题", summary: "巴西巴伊亚州劳工检察部门对比亚迪卡马萨里工厂建设承包商的工人居住与用工条件展开调查，比亚迪表示已终止与涉事承包商合作并配合调查。", source: "南方周末", daysAgo: 15 },
  { title: "GWM launches Tank 300 hybrid in Australia, Haval H6 tops medium SUV sales chart", summary: "Great Wall Motor introduced the Tank 300 Hybrid in Australia while the Haval H6 became the country's best-selling medium SUV for the month, ahead of the Toyota RAV4.", source: "CarExpert", daysAgo: 16, language: "en" },
  { title: "欧盟拟要求中国车企在欧建厂须技术转让并合资，欧洲议会推动新规", summary: "欧洲议会多名议员提出议案，要求获得欧盟补贴或市场准入便利的中国汽车企业与本地企业合资并共享电池技术，引发行业争议。", source: "环球时报", daysAgo: 17 },
  { title: "Chery targets 1 million overseas sales in 2026 as exports hit new monthly record", summary: "Chery Group said overseas sales rose to a record 128,000 units last month, with Russia, Brazil, Mexico and Turkey as its largest markets, and reiterated its target of one million overseas units this year.", source: "CnEVPost", daysAgo: 18, language: "en" },
  { title: "小鹏 G6 正式进入阿联酋、卡塔尔市场，中东经销网络覆盖 6 国", summary: "小鹏汽车宣布与阿联酋 Ali & Sons 集团合作，G6、G9 在迪拜上市，同时进入卡塔尔市场，中东布局扩展至 6 个国家。", source: "亿欧汽车", daysAgo: 19 },
  { title: "US finalizes rule banning Chinese connected-vehicle software from model year 2027", summary: "The US Commerce Department's final rule prohibits the sale of connected vehicles containing Chinese-developed software, effectively shutting Chinese automakers out of the US market.", source: "The Verge", daysAgo: 20, language: "en" },
  { title: "零跑 C10 登陆澳大利亚，采用 Stellantis 经销网络销售", summary: "Leapmotor 借助 Stellantis 澳大利亚经销网络推出 C10 增程版和纯电版，成为进入澳洲市场的又一中国新势力品牌。", source: "第一电动", daysAgo: 21 },
  { title: "Vietnam's VinFast rival BYD opens 30th dealership as Chinese brands face new emissions-linked registration fees", summary: "BYD expanded to 30 showrooms in Vietnam while Hanoi introduced registration fee changes that favour locally assembled vehicles over imports.", source: "Nikkei Asia", daysAgo: 22, language: "en" },
];

function seedLink(title: string): string {
  return `https://news.google.com/search?q=${encodeURIComponent(title)}`;
}

function seedId(index: number, title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return `seed-${index}-${h.toString(16)}`;
}

export function getSeedItems(now = new Date()): IntelItem[] {
  const items: IntelItem[] = SEED_ROWS.map((row, i) => {
    const published = new Date(now.getTime() - row.daysAgo * 86_400_000 - (i % 7) * 3_600_000);
    return {
      id: seedId(i, row.title),
      title: row.title,
      summary: row.summary,
      link: seedLink(row.title),
      source: row.source,
      publishedAt: published.toISOString(),
      language: row.language ?? "zh",
      isSeed: true,
      ...classify({ title: row.title, summary: row.summary }),
    };
  });
  return dedupe(items);
}
