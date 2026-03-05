"use client";

import { useEffect, useState } from "react";
import { IconGitHub } from "@/components/icons";
import { siteConfig } from "@/lib/site-config";
interface AnalyticsSummary {
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

// 国家代码到中文名称的映射（常用国家）
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

function getCountryName(code: string): string {
  return countryNames[code] || code;
}

function formatNumber(num: number): string {
  // 使用中文单位：万、亿
  if (num >= 100000000) {
    // 亿
    return (num / 100000000).toFixed(2) + "亿";
  }
  if (num >= 10000) {
    // 万
    return (num / 10000).toFixed(1) + "万";
  }
  return num.toLocaleString();
}

function formatRelativeTime(lastAt: string): string {
  const lastTime = new Date(lastAt).getTime();
  const now = Date.now();
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



// 国家代码转 emoji flag（零 bundle 成本）
function countryCodeToEmoji(code: string): string {
  const upperCode = code.toUpperCase();
  if (upperCode.length !== 2) return "🏳️";
  const codePoints = [...upperCode].map(
    (c) => 0x1f1e6 + c.charCodeAt(0) - 65
  );
  return String.fromCodePoint(...codePoints);
}

function CountryFlag({ countryCode }: { countryCode: string }) {
  const emoji = countryCodeToEmoji(countryCode);
  return (
    <span className="inline-block text-sm" title={getCountryName(countryCode.toUpperCase())}>
      {emoji}
    </span>
  );
}
// 客户端缓存配置
const CLIENT_CACHE_KEY = "umami_analytics_cache";
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

function getClientCache(): AnalyticsSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CLIENT_CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached) as { data: AnalyticsSummary; timestamp: number };
    if (Date.now() - timestamp > CLIENT_CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setClientCache(data: AnalyticsSummary) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

function AnalyticsDisplay() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // 延迟显示 loading，避免闪烁
  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      if (isLoading) setShowLoading(true);
    }, 300); // 300ms 后才显示 loading
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    // 1. 先尝试从客户端缓存读取
    const cached = getClientCache();
    if (cached) {
      setSummary(cached);
    }

    // 2. 无论是否有缓存，都发起请求获取最新数据
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/analytics/summary");
        if (response.ok) {
          const data = (await response.json()) as AnalyticsSummary;
          setSummary(data);
          setClientCache(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics summary:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // 有缓存数据时直接显示，不再显示 loading
  if (!summary) {
    // 真正首次加载才显示 loading
    return showLoading ? (
      <div className="flex items-center gap-x-3 text-[13px] text-zinc-300 dark:text-zinc-600">
        <span className="inline-flex items-center gap-1">
          <svg className="h-3 w-3 animate-spin opacity-60" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="opacity-60">加载中...</span>
        </span>
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-400 dark:text-zinc-500">
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        总浏览量: {formatNumber(summary.totalPageViews)}
      </span>
      <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">·</span>
      {summary.recentVisitor && summary.recentVisitor.country ? (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          近期访客:
          <CountryFlag countryCode={summary.recentVisitor.country} />
          <span>{getCountryName(summary.recentVisitor.country)} {formatRelativeTime(summary.recentVisitor.lastAt)}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          近期访客: 未知
        </span>
      )}
    </div>
  );
}


export function SiteFooter() {
  return (
    <footer className="site-footer mt-12 border-t border-zinc-200/80 py-6 dark:border-zinc-800/80">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
        {/* 第一行：技术栈 - 左右对齐 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* 左边：技术栈信息 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-400 dark:text-zinc-500">
            <a href="https://www.cloudflare.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300">
              <img
                src="/icons/cloudflare-icon.svg"
                alt="Cloudflare"
                className="inline-block h-3.5 w-3.5 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
              Cloudflare
            </a>
            <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">·</span>
            <span>
              Powered by{" "}
              <a href="https://github.com/cloudflare/vinext" target="_blank" rel="noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
                vinext
              </a>
            </span>
            <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">·</span>
            <a
              href={`https://github.com/${siteConfig.contentRepo.owner}/${siteConfig.contentRepo.repo}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <IconGitHub className="inline-block h-3.5 w-3.5" />
              Open Source
            </a>
          </div>
          {/* 右边：版权 + ICP */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-400 dark:text-zinc-500">
            <span>
              &copy; {new Date().getFullYear()}{" "}
              <a href={siteConfig.siteUrl} className="hover:text-zinc-600 dark:hover:text-zinc-300">
                {new URL(siteConfig.siteUrl).hostname.toUpperCase()}
              </a>
            </span>
            <span className="hidden md:inline text-zinc-300 dark:text-zinc-700">·</span>
            <a href="http://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              {siteConfig.beian}
            </a>
          </div>
        </div>
        
        {/* 第二行：统计数据 */}
        <div className="mt-3">
          <AnalyticsDisplay />
        </div>
      </div>
    </footer>
  );
}
