export interface AnalyticsSummary {
  totalPageViews: number;
  totalVisitors: number;
  totalVisits: number;
  recentVisitor: {
    country: string;
    region: string;
    city: string;
    lastAt: string;
  } | null;
}

const countryNames: Record<string, string> = {
  CN: "中国",
  US: "美国",
  GB: "英国",
  JP: "日本",
  KR: "韩国",
  DE: "德国",
  FR: "法国",
  CA: "加拿大",
  AU: "澳大利亚",
  SG: "新加坡",
  HK: "中国香港",
  TW: "中国台湾",
  IN: "印度",
  RU: "俄罗斯",
  BR: "巴西",
  MX: "墨西哥",
  ES: "西班牙",
  IT: "意大利",
  NL: "荷兰",
  SE: "瑞典",
  CH: "瑞士",
  IE: "爱尔兰",
  NZ: "新西兰",
  ZA: "南非",
  AE: "阿联酋",
  TH: "泰国",
  VN: "越南",
  MY: "马来西亚",
  PH: "菲律宾",
  ID: "印尼",
  TR: "土耳其",
  PL: "波兰",
  UA: "乌克兰",
  IL: "以色列",
  SA: "沙特",
  EG: "埃及",
  NG: "尼日利亚",
  KE: "肯尼亚",
  AR: "阿根廷",
  CL: "智利",
  CO: "哥伦比亚",
  PE: "秘鲁",
  VE: "委内瑞拉",
  BD: "孟加拉",
  PK: "巴基斯坦",
  LK: "斯里兰卡",
  NP: "尼泊尔",
  MM: "缅甸",
  KH: "柬埔寨",
  LA: "老挝",
  BT: "不丹",
  MV: "马尔代夫",
  AF: "阿富汗",
  IR: "伊朗",
  IQ: "伊拉克",
  SY: "叙利亚",
  JO: "约旦",
  LB: "黎巴嫩",
  OM: "阿曼",
  QA: "卡塔尔",
  KW: "科威特",
  BH: "巴林",
  YE: "也门",
  AZ: "阿塞拜疆",
  AM: "亚美尼亚",
  GE: "格鲁吉亚",
  KZ: "哈萨克斯坦",
  UZ: "乌兹别克斯坦",
  TM: "土库曼斯坦",
  KG: "吉尔吉斯斯坦",
  TJ: "塔吉克斯坦",
  MN: "蒙古",
  KP: "朝鲜",
  FI: "芬兰",
  NO: "挪威",
  DK: "丹麦",
  IS: "冰岛",
  PT: "葡萄牙",
  BE: "比利时",
  AT: "奥地利",
  CZ: "捷克",
  SK: "斯洛伐克",
  HU: "匈牙利",
  RO: "罗马尼亚",
  BG: "保加利亚",
  HR: "克罗地亚",
  SI: "斯洛文尼亚",
  RS: "塞尔维亚",
  BA: "波黑",
  ME: "黑山",
  MK: "北马其顿",
  AL: "阿尔巴尼亚",
  GR: "希腊",
  LT: "立陶宛",
  LV: "拉脱维亚",
  EE: "爱沙尼亚",
  BY: "白俄罗斯",
  MD: "摩尔多瓦",
  MT: "马耳他",
  CY: "塞浦路斯",
  LU: "卢森堡",
  LI: "列支敦士登",
  MC: "摩纳哥",
  SM: "圣马力诺",
  AD: "安道尔",
  VA: "梵蒂冈",
  UNKNOWN: "未知地区",
};

export function getCountryName(code: string): string {
  return countryNames[code.toUpperCase()] || code;
}

export function formatAnalyticsNumber(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }
  return value.toLocaleString();
}

export function formatRelativeTime(lastAt: string, now = Date.now()): string {
  const lastTime = new Date(lastAt).getTime();
  const diffMs = now - lastTime;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "刚刚";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }
  if (diffDays < 30) {
    return `${diffDays}天前`;
  }

  return "";
}

export function countryCodeToEmoji(code: string): string {
  const upperCode = code.toUpperCase();
  if (upperCode.length !== 2) return "🏳️";

  const codePoints = [...upperCode].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
