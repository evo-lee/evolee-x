/**
 * Umami Analytics API Client
 * 用于从自托管 Umami 获取统计数据
 */

import { getUmamiConfig } from "./umami-config";

// 统计数据项
export interface UmamiPageView {
  page: string;
  hit: number;
}

export interface UmamiStatsResult {
  total: number;
  data: UmamiPageView[];
}

/**
 * 从 Umami API 获取页面浏览量数据
 * 
 * 本地开发和生产环境都会调用 Umami API 获取历史统计数据
 * 注意：Umami 只记录配置的域名（luolei.org）的新访问，但 API 可以查询所有历史数据
 */
export async function fetchUmamiPageViews(): Promise<UmamiStatsResult> {
  try {
    const { apiUrl, websiteId, apiToken } = getUmamiConfig();
    
    // 调试日志（生产环境临时启用）
    console.log("[Umami Debug] apiUrl:", apiUrl);
    console.log("[Umami Debug] websiteId:", websiteId);
    console.log("[Umami Debug] hasToken:", !!apiToken);

    if (!apiUrl || !websiteId) {
      console.warn("[Umami] API URL or Website ID not configured");
      return { total: 0, data: [] };
    }

    // 计算时间范围：从 2015-01-01 到 2030-01-01（确保包含所有历史数据）
    const startAt = new Date("2015-01-01").getTime();
    const endAt = new Date("2030-01-01").getTime();

    // 构建请求头
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    // 尝试获取页面 URL 统计数据 - 使用 /metrics 端点
    // Umami v3 API: type=path (v2 是 type=url)
    const metricsUrl = new URL(`${apiUrl}/websites/${websiteId}/metrics`);
    metricsUrl.searchParams.set("startAt", startAt.toString());
    metricsUrl.searchParams.set("endAt", endAt.toString());
    metricsUrl.searchParams.set("type", "path");

    console.log("[Umami] Fetching metrics from:", metricsUrl.toString());

    // 使用 AbortController 替代 AbortSignal.timeout（兼容性更好）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const metricsResponse = await fetch(metricsUrl.toString(), {
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    let pageData: UmamiPageView[] = [];

    if (metricsResponse.ok) {
      const metricsData = (await metricsResponse.json()) as Array<{
        x: string;
        y: number;
      }>;

      console.log(`[Umami] Got ${metricsData.length} metrics entries`);

      pageData = metricsData.map((item) => ({
        page: item.x,
        hit: item.y,
      }));
    } else {
      const errorText = await metricsResponse.text().catch(() => "Unknown error");
      console.error("[Umami] Metrics API error:", metricsResponse.status, errorText);

      // 如果 metrics 失败，尝试 pageviews 端点
      const pageviewsUrl = new URL(`${apiUrl}/websites/${websiteId}/pageviews`);
      pageviewsUrl.searchParams.set("startAt", startAt.toString());
      pageviewsUrl.searchParams.set("endAt", endAt.toString());
      pageviewsUrl.searchParams.set("unit", "year");
      pageviewsUrl.searchParams.set("tz", "Asia/Shanghai");

      console.log("[Umami] Trying pageviews endpoint:", pageviewsUrl.toString());

      const pvController = new AbortController();
      const pvTimeoutId = setTimeout(() => pvController.abort(), 10000);
      
      const pageviewsResponse = await fetch(pageviewsUrl.toString(), {
        headers,
        signal: pvController.signal,
      });
      
      clearTimeout(pvTimeoutId);

      if (pageviewsResponse.ok) {
        const pageviewsData = (await pageviewsResponse.json()) as {
          pageviews?: Array<{ x: string; y: number }>;
        };

        if (pageviewsData.pageviews) {
          pageData = pageviewsData.pageviews.map((item) => ({
            page: item.x,
            hit: item.y,
          }));
        }
      } else {
        const errorText = await pageviewsResponse.text().catch(() => "Unknown error");
        console.error("[Umami] Pageviews API error:", pageviewsResponse.status, errorText);
      }
    }

    if (pageData.length === 0) {
      console.warn("[Umami] No page data available from API");
    }

    const total = pageData.reduce((sum, item) => sum + item.hit, 0);

    console.log(`[Umami] Total pageviews: ${total}, Pages: ${pageData.length}`);

    return {
      total,
      data: pageData,
    };
  } catch (error) {
    console.error("[Umami] Failed to fetch page views:", error);
    // 出错时返回空数据，不影响页面渲染
    return { total: 0, data: [] };
  }
}

/**
 * 验证 Umami 配置是否完整
 */
export function isUmamiConfigured(): boolean {
  const config = getUmamiConfig();
  return !!(config.apiUrl && config.websiteId);
}

/**
 * 获取 Umami 追踪脚本配置
 */
export function getUmamiScriptConfig():
  | {
      src: string;
      websiteId: string;
    }
  | null {
  const { websiteId, scriptUrl } = getUmamiConfig();

  if (!websiteId) {
    return null;
  }

  return {
    src: scriptUrl,
    websiteId,
  };
}
