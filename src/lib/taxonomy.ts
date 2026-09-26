import type { Company, Country, Dimension, DimensionId, Region } from "./types";

/**
 * 出海企业词表。aliases 同时用于中英文识别（含主要子品牌）。
 * 扩展新企业只需在此追加一项。
 */
export const COMPANIES: Company[] = [
  {
    id: "byd",
    name: "比亚迪",
    nameEn: "BYD",
    aliases: ["byd", "比亚迪", "denza", "腾势", "yangwang", "仰望", "fangchengbao", "方程豹", "build your dreams"],
    queryEn: "BYD",
    queryZh: "比亚迪",
  },
  {
    id: "chery",
    name: "奇瑞",
    nameEn: "Chery",
    aliases: ["chery", "奇瑞", "omoda", "欧萌达", "jaecoo", "exeed", "星途", "jetour", "捷途", "icar"],
    queryEn: "Chery",
    queryZh: "奇瑞",
  },
  {
    id: "saic",
    name: "上汽 / MG 名爵",
    nameEn: "SAIC / MG",
    aliases: ["saic", "上汽", "mg", "mg3", "mg4", "mg5", "mg7", "mgs5", "mg zs", "mg hs", "cyberster", "名爵", "im motors", "智己", "maxus", "大通", "roewe", "荣威"],
    queryEn: "MG Motor SAIC",
    queryZh: "上汽 名爵",
  },
  {
    id: "gwm",
    name: "长城",
    nameEn: "Great Wall Motor",
    aliases: ["great wall", "gwm", "长城汽车", "长城", "haval", "哈弗", "ora", "欧拉", "tank 300", "tank 500", "坦克", "wey", "魏牌", "poer", "长城炮"],
    queryEn: "Great Wall Motor GWM",
    queryZh: "长城汽车",
  },
  {
    id: "geely",
    name: "吉利",
    nameEn: "Geely",
    aliases: ["geely", "吉利", "zeekr", "极氪", "lynk", "领克", "geely galaxy", "吉利银河", "proton"],
    queryEn: "Geely",
    queryZh: "吉利",
  },
  {
    id: "changan",
    name: "长安",
    nameEn: "Changan",
    aliases: ["changan", "长安", "deepal", "深蓝", "avatr", "阿维塔", "qiyuan", "启源"],
    queryEn: "Changan",
    queryZh: "长安汽车",
  },
  {
    id: "nio",
    name: "蔚来",
    nameEn: "NIO",
    aliases: ["nio", "蔚来", "onvo", "乐道", "firefly", "萤火虫"],
    queryEn: "NIO",
    queryZh: "蔚来",
  },
  {
    id: "xpeng",
    name: "小鹏",
    nameEn: "XPeng",
    aliases: ["xpeng", "小鹏", "xiaopeng"],
    queryEn: "XPeng",
    queryZh: "小鹏汽车",
  },
  {
    id: "leapmotor",
    name: "零跑",
    nameEn: "Leapmotor",
    aliases: ["leapmotor", "leap motor", "零跑"],
    queryEn: "Leapmotor",
    queryZh: "零跑",
  },
];

export const REGIONS: Region[] = [
  { id: "europe", name: "欧洲", nameEn: "Europe", queryEn: "Europe", queryZh: "欧洲" },
  { id: "sea", name: "东南亚", nameEn: "Southeast Asia", queryEn: "Southeast Asia", queryZh: "东南亚" },
  { id: "latam", name: "拉美", nameEn: "Latin America", queryEn: "Brazil OR Chile OR Colombia", queryZh: "巴西 OR 智利" },
  { id: "mexico", name: "墨西哥", nameEn: "Mexico", queryEn: "Mexico", queryZh: "墨西哥" },
  { id: "mideast", name: "中东", nameEn: "Middle East", queryEn: "Middle East OR UAE OR Saudi", queryZh: "中东" },
  { id: "oceania", name: "澳洲", nameEn: "Oceania", queryEn: "Australia", queryZh: "澳大利亚" },
  { id: "russia", name: "俄罗斯 / 中亚", nameEn: "Russia & Central Asia", queryEn: "Russia", queryZh: "俄罗斯" },
  { id: "namerica", name: "北美", nameEn: "North America", queryEn: "United States OR Canada", queryZh: "美国 OR 加拿大" },
  { id: "asia_other", name: "日韩印", nameEn: "Japan / Korea / India", queryEn: "Japan OR India", queryZh: "日本 OR 印度" },
  { id: "africa", name: "非洲", nameEn: "Africa", queryEn: "Africa", queryZh: "非洲" },
];

export const COUNTRIES: Country[] = [
  // 欧洲
  { id: "eu", name: "欧盟", nameEn: "EU", regionId: "europe", aliases: ["european union", "欧盟", "eu", "brussels", "布鲁塞尔", "european commission", "欧委会", "欧洲委员会", "europe", "欧洲"] },
  { id: "de", name: "德国", nameEn: "Germany", regionId: "europe", aliases: ["germany", "german", "德国", "berlin", "柏林", "munich", "慕尼黑"] },
  { id: "uk", name: "英国", nameEn: "United Kingdom", regionId: "europe", aliases: ["united kingdom", "britain", "british", "英国", "uk", "london", "伦敦"] },
  { id: "fr", name: "法国", nameEn: "France", regionId: "europe", aliases: ["france", "french", "法国", "paris", "巴黎"] },
  { id: "it", name: "意大利", nameEn: "Italy", regionId: "europe", aliases: ["italy", "italian", "意大利", "rome", "罗马"] },
  { id: "es", name: "西班牙", nameEn: "Spain", regionId: "europe", aliases: ["spain", "spanish", "西班牙", "barcelona", "巴塞罗那"] },
  { id: "hu", name: "匈牙利", nameEn: "Hungary", regionId: "europe", aliases: ["hungary", "hungarian", "匈牙利", "szeged", "塞格德"] },
  { id: "nl", name: "荷兰", nameEn: "Netherlands", regionId: "europe", aliases: ["netherlands", "dutch", "荷兰"] },
  { id: "no", name: "挪威", nameEn: "Norway", regionId: "europe", aliases: ["norway", "norwegian", "挪威"] },
  { id: "pl", name: "波兰", nameEn: "Poland", regionId: "europe", aliases: ["poland", "polish", "波兰"] },
  { id: "tr", name: "土耳其", nameEn: "Turkey", regionId: "europe", aliases: ["turkey", "türkiye", "turkish", "土耳其"] },
  { id: "be", name: "比利时", nameEn: "Belgium", regionId: "europe", aliases: ["belgium", "比利时"] },
  { id: "pt", name: "葡萄牙", nameEn: "Portugal", regionId: "europe", aliases: ["portugal", "葡萄牙"] },
  { id: "ch", name: "瑞士", nameEn: "Switzerland", regionId: "europe", aliases: ["switzerland", "swiss", "瑞士"] },
  // 东南亚
  { id: "th", name: "泰国", nameEn: "Thailand", regionId: "sea", aliases: ["thailand", "thai", "泰国", "rayong", "罗勇"] },
  { id: "id", name: "印尼", nameEn: "Indonesia", regionId: "sea", aliases: ["indonesia", "indonesian", "印尼", "印度尼西亚", "jakarta", "雅加达"] },
  { id: "my", name: "马来西亚", nameEn: "Malaysia", regionId: "sea", aliases: ["malaysia", "malaysian", "马来西亚", "kuala lumpur"] },
  { id: "vn", name: "越南", nameEn: "Vietnam", regionId: "sea", aliases: ["vietnam", "vietnamese", "越南"] },
  { id: "ph", name: "菲律宾", nameEn: "Philippines", regionId: "sea", aliases: ["philippines", "philippine", "菲律宾"] },
  { id: "sg", name: "新加坡", nameEn: "Singapore", regionId: "sea", aliases: ["singapore", "新加坡"] },
  // 拉美
  { id: "br", name: "巴西", nameEn: "Brazil", regionId: "latam", aliases: ["brazil", "brazilian", "巴西", "camaçari", "camacari", "bahia", "巴伊亚"] },
  { id: "cl", name: "智利", nameEn: "Chile", regionId: "latam", aliases: ["chile", "chilean", "智利"] },
  { id: "co", name: "哥伦比亚", nameEn: "Colombia", regionId: "latam", aliases: ["colombia", "哥伦比亚"] },
  { id: "ar", name: "阿根廷", nameEn: "Argentina", regionId: "latam", aliases: ["argentina", "阿根廷"] },
  { id: "pe", name: "秘鲁", nameEn: "Peru", regionId: "latam", aliases: ["peru", "秘鲁"] },
  { id: "uy", name: "乌拉圭", nameEn: "Uruguay", regionId: "latam", aliases: ["uruguay", "乌拉圭"] },
  // 墨西哥
  { id: "mx", name: "墨西哥", nameEn: "Mexico", regionId: "mexico", aliases: ["mexico", "mexican", "墨西哥"] },
  // 中东
  { id: "ae", name: "阿联酋", nameEn: "UAE", regionId: "mideast", aliases: ["uae", "united arab emirates", "dubai", "abu dhabi", "阿联酋", "迪拜", "阿布扎比"] },
  { id: "sa", name: "沙特", nameEn: "Saudi Arabia", regionId: "mideast", aliases: ["saudi", "沙特", "riyadh", "利雅得"] },
  { id: "il", name: "以色列", nameEn: "Israel", regionId: "mideast", aliases: ["israel", "以色列"] },
  { id: "qa", name: "卡塔尔", nameEn: "Qatar", regionId: "mideast", aliases: ["qatar", "卡塔尔"] },
  { id: "eg", name: "埃及", nameEn: "Egypt", regionId: "africa", aliases: ["egypt", "埃及"] },
  // 澳洲
  { id: "au", name: "澳大利亚", nameEn: "Australia", regionId: "oceania", aliases: ["australia", "australian", "澳大利亚", "澳洲", "sydney", "melbourne"] },
  { id: "nz", name: "新西兰", nameEn: "New Zealand", regionId: "oceania", aliases: ["new zealand", "新西兰"] },
  // 俄罗斯/中亚
  { id: "ru", name: "俄罗斯", nameEn: "Russia", regionId: "russia", aliases: ["russia", "russian", "俄罗斯", "moscow", "莫斯科"] },
  { id: "kz", name: "哈萨克斯坦", nameEn: "Kazakhstan", regionId: "russia", aliases: ["kazakhstan", "哈萨克"] },
  { id: "uz", name: "乌兹别克斯坦", nameEn: "Uzbekistan", regionId: "russia", aliases: ["uzbekistan", "乌兹别克"] },
  // 北美
  { id: "us", name: "美国", nameEn: "United States", regionId: "namerica", aliases: ["united states", "u.s.", "usa", "美国", "washington", "华盛顿", "white house", "白宫", "trump", "特朗普"] },
  { id: "ca", name: "加拿大", nameEn: "Canada", regionId: "namerica", aliases: ["canada", "canadian", "加拿大", "ottawa"] },
  // 日韩印
  { id: "jp", name: "日本", nameEn: "Japan", regionId: "asia_other", aliases: ["japan", "japanese", "日本", "tokyo", "东京"] },
  { id: "kr", name: "韩国", nameEn: "South Korea", regionId: "asia_other", aliases: ["south korea", "korea", "韩国", "seoul", "首尔"] },
  { id: "in", name: "印度", nameEn: "India", regionId: "asia_other", aliases: ["india", "indian", "印度", "new delhi", "新德里"] },
  // 非洲
  { id: "za", name: "南非", nameEn: "South Africa", regionId: "africa", aliases: ["south africa", "南非"] },
  { id: "ma", name: "摩洛哥", nameEn: "Morocco", regionId: "africa", aliases: ["morocco", "摩洛哥"] },
  { id: "ng", name: "尼日利亚", nameEn: "Nigeria", regionId: "africa", aliases: ["nigeria", "尼日利亚"] },
];

export const DIMENSIONS: Dimension[] = [
  {
    id: "launch",
    name: "新品发布",
    description: "新车型上市、首发、预售、定价与配置信息",
    keywords: [
      { term: "launch", weight: 3 }, { term: "launches", weight: 3 }, { term: "launched", weight: 3 },
      { term: "unveil", weight: 3 }, { term: "unveils", weight: 3 }, { term: "unveiled", weight: 3 },
      { term: "debut", weight: 3 }, { term: "reveal", weight: 2 }, { term: "revealed", weight: 2 },
      { term: "new model", weight: 3 }, { term: "new suv", weight: 3 }, { term: "new ev", weight: 2 },
      { term: "pre-order", weight: 2 }, { term: "goes on sale", weight: 3 }, { term: "on sale", weight: 2 },
      { term: "pricing", weight: 2 }, { term: "priced", weight: 2 }, { term: "starts at", weight: 2 },
      { term: "first look", weight: 2 }, { term: "review", weight: 1 }, { term: "test drive", weight: 1 },
      { term: "motor show", weight: 2 }, { term: "auto show", weight: 2 }, { term: "arrives", weight: 2 }, { term: "arrive", weight: 2 },
      { term: "coming to", weight: 2 }, { term: "confirmed for", weight: 2 }, { term: "spied", weight: 2 }, { term: "teased", weight: 2 },
      { term: "teases", weight: 2 }, { term: "specs", weight: 2 }, { term: "range", weight: 1 }, { term: "hybrid", weight: 1 }, { term: "phev", weight: 1 },
      { term: "ute", weight: 1 }, { term: "hatchback", weight: 1 }, { term: "sedan", weight: 1 }, { term: "suv", weight: 1 }, { term: "supercar", weight: 1 },
      { term: "flagship", weight: 1 }, { term: "facelift", weight: 2 }, { term: "variant", weight: 1 }, { term: "order books", weight: 3 },
      { term: "上市", weight: 3 }, { term: "发布", weight: 3 }, { term: "首发", weight: 3 }, { term: "亮相", weight: 3 },
      { term: "预售", weight: 3 }, { term: "新车", weight: 2 }, { term: "车型", weight: 1 }, { term: "售价", weight: 2 },
      { term: "定价", weight: 2 }, { term: "车展", weight: 2 }, { term: "登陆", weight: 2 }, { term: "开售", weight: 3 },
    ],
  },
  {
    id: "sales",
    name: "销量",
    description: "交付量、注册量、市场份额、销售排名与增长数据",
    keywords: [
      { term: "sales", weight: 3 }, { term: "sold", weight: 3 }, { term: "deliveries", weight: 3 }, { term: "delivered", weight: 2 },
      { term: "registrations", weight: 3 }, { term: "market share", weight: 3 }, { term: "best-selling", weight: 3 },
      { term: "bestseller", weight: 3 }, { term: "top seller", weight: 3 }, { term: "outsold", weight: 3 }, { term: "outsells", weight: 3 },
      { term: "surge", weight: 2 }, { term: "surges", weight: 2 }, { term: "record", weight: 1 }, { term: "units", weight: 2 },
      { term: "volume", weight: 1 }, { term: "demand", weight: 1 }, { term: "overtake", weight: 2 }, { term: "overtakes", weight: 2 },
      { term: "year-on-year", weight: 2 }, { term: "yoy", weight: 2 }, { term: "quarter", weight: 1 }, { term: "ranking", weight: 2 },
      { term: "outselling", weight: 3 }, { term: "outsell", weight: 3 }, { term: "overtaking", weight: 2 }, { term: "overtook", weight: 2 },
      { term: "tops", weight: 2 }, { term: "topped", weight: 2 }, { term: "sells", weight: 2 }, { term: "sell", weight: 1 }, { term: "buyers", weight: 2 },
      { term: "shipments", weight: 3 }, { term: "shipped", weight: 2 }, { term: "exports", weight: 2 }, { term: "export", weight: 1 }, { term: "cars a month", weight: 3 },
      { term: "leads", weight: 1 }, { term: "leader", weight: 1 }, { term: "gains", weight: 2 }, { term: "revenue", weight: 2 }, { term: "profit", weight: 2 },
      { term: "price war", weight: 2 }, { term: "price cut", weight: 2 }, { term: "discount", weight: 2 }, { term: "cheapest", weight: 1 },
      { term: "卸", weight: 1 }, { term: "运抵", weight: 2 }, { term: "滚装船", weight: 3 }, { term: "船", weight: 1 }, { term: "营收", weight: 2 }, { term: "净利", weight: 2 },
      { term: "降价", weight: 2 }, { term: "价格战", weight: 2 }, { term: "份额", weight: 2 }, { term: "排名", weight: 2 }, { term: "第一", weight: 1 },
      { term: "销量", weight: 3 }, { term: "交付", weight: 3 }, { term: "注册量", weight: 3 }, { term: "上险", weight: 3 },
      { term: "市占率", weight: 3 }, { term: "市场份额", weight: 3 }, { term: "同比", weight: 2 }, { term: "环比", weight: 2 },
      { term: "销冠", weight: 3 }, { term: "榜首", weight: 2 }, { term: "万辆", weight: 3 }, { term: "出口量", weight: 3 }, { term: "出口", weight: 1 },
      { term: "热销", weight: 2 }, { term: "订单", weight: 2 }, { term: "反超", weight: 2 }, { term: "超越", weight: 1 },
    ],
  },
  {
    id: "production",
    name: "生产 / 建厂",
    description: "海外工厂、产能、投产、供应链与本地化生产",
    keywords: [
      { term: "factory", weight: 3 }, { term: "plant", weight: 3 }, { term: "production", weight: 2 }, { term: "manufacturing", weight: 3 },
      { term: "assembly", weight: 3 }, { term: "assemble", weight: 3 }, { term: "capacity", weight: 2 }, { term: "ckd", weight: 3 },
      { term: "build a plant", weight: 4 }, { term: "gigafactory", weight: 3 }, { term: "localize", weight: 3 }, { term: "localization", weight: 3 },
      { term: "localisation", weight: 3 }, { term: "supply chain", weight: 2 }, { term: "battery plant", weight: 3 }, { term: "hiring", weight: 1 },
      { term: "groundbreaking", weight: 3 }, { term: "rolls off", weight: 3 }, { term: "starts production", weight: 4 }, { term: "workers", weight: 1 },
      { term: "工厂", weight: 3 }, { term: "建厂", weight: 4 }, { term: "投产", weight: 4 }, { term: "产能", weight: 3 }, { term: "生产基地", weight: 4 },
      { term: "下线", weight: 3 }, { term: "本地化生产", weight: 4 }, { term: "本土化", weight: 3 }, { term: "组装", weight: 3 }, { term: "供应链", weight: 2 },
      { term: "奠基", weight: 4 }, { term: "开工", weight: 3 }, { term: "落地", weight: 1 }, { term: "生产", weight: 1 }, { term: "电池厂", weight: 3 },
    ],
  },
  {
    id: "strategy",
    name: "战略 / 合作",
    description: "合资、经销网络、渠道、融资、并购与战略布局",
    keywords: [
      { term: "partnership", weight: 3 }, { term: "partner", weight: 2 }, { term: "joint venture", weight: 4 }, { term: "agreement", weight: 3 },
      { term: "deal", weight: 2 }, { term: "acquire", weight: 3 }, { term: "acquisition", weight: 3 }, { term: "stake", weight: 3 },
      { term: "invest", weight: 2 }, { term: "investment", weight: 2 }, { term: "expansion", weight: 2 }, { term: "expand", weight: 2 },
      { term: "expands", weight: 2 }, { term: "dealer", weight: 3 }, { term: "dealership", weight: 3 }, { term: "showroom", weight: 3 },
      { term: "distributor", weight: 3 }, { term: "distribution", weight: 2 }, { term: "strategy", weight: 3 }, { term: "strategic", weight: 3 },
      { term: "enter", weight: 2 }, { term: "enters", weight: 3 }, { term: "entry", weight: 2 }, { term: "headquarters", weight: 3 },
      { term: "collaboration", weight: 3 }, { term: "collaborate", weight: 3 }, { term: "mou", weight: 3 }, { term: "sponsor", weight: 2 },
      { term: "ceo", weight: 1 }, { term: "hires", weight: 1 }, { term: "appoints", weight: 2 }, { term: "charging network", weight: 2 },
      { term: "plans", weight: 2 }, { term: "plan", weight: 1 }, { term: "aims", weight: 2 }, { term: "target", weight: 1 }, { term: "targets", weight: 2 },
      { term: "push", weight: 2 }, { term: "bet", weight: 2 }, { term: "bets", weight: 2 }, { term: "ambition", weight: 2 }, { term: "ambitions", weight: 2 },
      { term: "goes global", weight: 3 }, { term: "global expansion", weight: 3 }, { term: "overseas expansion", weight: 3 }, { term: "footprint", weight: 2 },
      { term: "shipping", weight: 2 }, { term: "car carrier", weight: 3 }, { term: "fleet", weight: 2 }, { term: "brand", weight: 1 }, { term: "rebrand", weight: 2 },
      { term: "why", weight: 1 }, { term: "how", weight: 1 }, { term: "interview", weight: 2 }, { term: "warranty", weight: 1 }, { term: "service network", weight: 3 },
      { term: "计划", weight: 2 }, { term: "目标", weight: 2 }, { term: "野心", weight: 2 }, { term: "船队", weight: 2 }, { term: "航线", weight: 2 }, { term: "品牌", weight: 1 },
      { term: "专访", weight: 2 }, { term: "解读", weight: 1 }, { term: "售后", weight: 2 }, { term: "服务网络", weight: 3 }, { term: "本地团队", weight: 2 },
      { term: "合作", weight: 3 }, { term: "合资", weight: 4 }, { term: "战略", weight: 3 }, { term: "签约", weight: 3 }, { term: "协议", weight: 3 },
      { term: "收购", weight: 3 }, { term: "入股", weight: 3 }, { term: "投资", weight: 2 }, { term: "布局", weight: 2 }, { term: "进军", weight: 3 },
      { term: "进入", weight: 2 }, { term: "经销商", weight: 3 }, { term: "门店", weight: 3 }, { term: "渠道", weight: 3 }, { term: "总部", weight: 2 },
      { term: "携手", weight: 3 }, { term: "牵手", weight: 3 }, { term: "扩张", weight: 2 }, { term: "换电", weight: 1 }, { term: "出海", weight: 1 },
    ],
  },
  {
    id: "policy",
    name: "政治规则 / 政策",
    description: "关税、反补贴、准入法规、本地化要求、安全审查与地缘政治",
    keywords: [
      { term: "tariff", weight: 5 }, { term: "tariffs", weight: 5 }, { term: "duty", weight: 3 }, { term: "duties", weight: 4 },
      { term: "anti-subsidy", weight: 5 }, { term: "countervailing", weight: 5 }, { term: "anti-dumping", weight: 5 }, { term: "subsidy", weight: 3 },
      { term: "subsidies", weight: 3 }, { term: "probe", weight: 4 }, { term: "investigation", weight: 4 }, { term: "regulation", weight: 4 },
      { term: "regulator", weight: 3 }, { term: "regulatory", weight: 3 }, { term: "ban", weight: 4 }, { term: "banned", weight: 4 },
      { term: "sanction", weight: 5 }, { term: "sanctions", weight: 5 }, { term: "minimum price", weight: 5 }, { term: "price undertaking", weight: 5 },
      { term: "trade war", weight: 5 }, { term: "trade dispute", weight: 5 }, { term: "wto", weight: 4 }, { term: "quota", weight: 4 },
      { term: "local content", weight: 5 }, { term: "localization requirement", weight: 5 }, { term: "type approval", weight: 4 }, { term: "homologation", weight: 4 },
      { term: "national security", weight: 4 }, { term: "data security", weight: 4 }, { term: "cybersecurity", weight: 3 }, { term: "government", weight: 2 },
      { term: "ministry", weight: 3 }, { term: "commission", weight: 2 }, { term: "parliament", weight: 3 }, { term: "lawmakers", weight: 3 },
      { term: "legislation", weight: 4 }, { term: "policy", weight: 3 }, { term: "incentive", weight: 3 }, { term: "incentives", weight: 3 },
      { term: "tax break", weight: 3 }, { term: "tax credit", weight: 3 }, { term: "customs", weight: 3 }, { term: "import rules", weight: 4 },
      { term: "geopolit", weight: 4 }, { term: "labor practices", weight: 3 }, { term: "labour", weight: 2 }, { term: "union", weight: 2 },
      { term: "关税", weight: 5 }, { term: "反补贴", weight: 5 }, { term: "反倾销", weight: 5 }, { term: "补贴", weight: 3 }, { term: "调查", weight: 3 },
      { term: "制裁", weight: 5 }, { term: "禁令", weight: 4 }, { term: "禁止", weight: 3 }, { term: "法规", weight: 4 }, { term: "监管", weight: 4 },
      { term: "准入", weight: 4 }, { term: "认证", weight: 3 }, { term: "本地化率", weight: 5 }, { term: "本地化要求", weight: 5 }, { term: "配额", weight: 4 },
      { term: "贸易战", weight: 5 }, { term: "贸易摩擦", weight: 5 }, { term: "世贸", weight: 4 }, { term: "最低价格", weight: 5 }, { term: "价格承诺", weight: 5 },
      { term: "政府", weight: 2 }, { term: "议会", weight: 3 }, { term: "政策", weight: 3 }, { term: "税收优惠", weight: 3 }, { term: "免税", weight: 3 },
      { term: "数据安全", weight: 4 }, { term: "国家安全", weight: 4 }, { term: "地缘", weight: 4 }, { term: "工会", weight: 2 }, { term: "劳工", weight: 3 },
      { term: "谈判", weight: 3 }, { term: "磋商", weight: 3 }, { term: "欧委会", weight: 3 }, { term: "海关", weight: 3 }, { term: "征税", weight: 5 },
    ],
  },
];

export const OTHER_DIMENSION: Dimension = {
  id: "other",
  name: "综合",
  description: "未命中任何维度关键词的其他相关报道",
  keywords: [],
};

export const ALL_DIMENSIONS: Dimension[] = [...DIMENSIONS, OTHER_DIMENSION];

export const DIMENSION_LABELS: Record<DimensionId, string> = Object.fromEntries(
  ALL_DIMENSIONS.map((d) => [d.id, d.name]),
) as Record<DimensionId, string>;

export const POSITIVE_TERMS = [
  "record", "surge", "surges", "soar", "soars", "boost", "boosts", "growth", "grows", "wins", "win", "award",
  "best-selling", "top seller", "outsold", "outsells", "expands", "expansion", "milestone", "approval", "approved",
  "partnership", "agreement", "tax break", "incentive", "incentives", "exempt", "exemption", "lifts", "scrap", "scraps",
  "创新高", "新高", "增长", "大涨", "突破", "领跑", "夺冠", "销冠", "获批", "签约", "携手", "落地", "投产", "里程碑", "免税", "优惠", "取消关税",
];

export const NEGATIVE_TERMS = [
  "tariff", "tariffs", "anti-subsidy", "countervailing", "anti-dumping", "probe", "investigation", "ban", "banned",
  "sanction", "sanctions", "recall", "recalls", "lawsuit", "sued", "fine", "fined", "penalty", "crackdown", "block", "blocked",
  "halt", "halts", "suspend", "suspends", "suspended", "delay", "delays", "delayed", "slump", "plunge", "plunges", "falls", "drop", "drops",
  "decline", "layoff", "layoffs", "dies", "death", "accident", "fire", "scrutiny", "warning", "warns", "risk", "threat", "dumping",
  "trade war", "backlash", "protest", "strike", "loss", "losses", "quits", "exit", "exits", "withdraw", "cuts", "collapse",
  "关税", "反补贴", "反倾销", "调查", "制裁", "禁令", "禁止", "召回", "起诉", "罚款", "处罚", "暂停", "停产", "推迟", "延期", "下滑", "暴跌",
  "下跌", "裁员", "事故", "起火", "警告", "风险", "威胁", "倾销", "贸易战", "抵制", "罢工", "亏损", "退出", "撤出", "受阻", "审查", "限制",
];

export const HIGH_RISK_TERMS = [
  "tariff", "tariffs", "anti-subsidy", "countervailing", "anti-dumping", "ban", "banned", "sanction", "sanctions", "trade war",
  "probe", "investigation", "national security", "local content", "minimum price", "quota", "crackdown", "blocked",
  "关税", "反补贴", "反倾销", "禁令", "禁止", "制裁", "贸易战", "调查", "国家安全", "本地化率", "最低价格", "配额", "征税", "限制",
];

export const COMPANY_MAP = new Map(COMPANIES.map((c) => [c.id, c]));
export const COUNTRY_MAP = new Map(COUNTRIES.map((c) => [c.id, c]));
export const REGION_MAP = new Map(REGIONS.map((r) => [r.id, r]));
