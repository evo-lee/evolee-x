import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const revalidate = 21600; // 6 小时

let cache: { data: { total: number; data: Array<{ page: string; hit: number }> }; timestamp: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: { "Cache-Control": "public, max-age=21600", "X-Cache": "HIT" },
      });
    }

    const apiUrl = siteConfig.analyticsApiUrl;
    if (!apiUrl) {
      return NextResponse.json(
        { total: 0, data: [] },
        { headers: { "Cache-Control": "public, max-age=3600" } },
      );
    }

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`stat API error: ${res.status}`);

    const data = (await res.json()) as { total: number; data: Array<{ page: string; hit: number }> };
    cache = { data, timestamp: Date.now() };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=21600", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("[Analytics] Error:", error);
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { "Cache-Control": "public, max-age=3600", "X-Cache": "STALE" },
      });
    }
    return NextResponse.json(
      { total: 0, data: [] },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  }
}
