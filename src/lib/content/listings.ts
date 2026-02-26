import { articlePageSize, categoryMap, siteConfig } from "@/lib/site-config";
import { extractSlug, parsePositivePage } from "@/lib/utils";
import { getAllPosts } from "./posts";
import type { PostItem } from "./types";

const categoryNameMap = new Map<string, string>(
  categoryMap.map((item) => [item.text, item.name]),
);

// 服务端缓存（6小时）
interface HitsCache {
  data: Map<string, number>;
  timestamp: number;
  loading: boolean;
}

let hitsCache: HitsCache | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface PostListingResult {
  category?: string;
  categoryName?: string;
  posts: PostItem[];
  visiblePosts: PostItem[];
  hitsMap: Map<string, number>;
  hitsLoading: boolean;
  requestedPage: number;
  page: number;
  pageTotal: number;
}

async function getHitsMap(): Promise<{
  hitsMap: Map<string, number>;
  hitsLoading: boolean;
}> {
  if (hitsCache && Date.now() - hitsCache.timestamp < CACHE_TTL_MS) {
    return { hitsMap: hitsCache.data, hitsLoading: hitsCache.loading };
  }

  const staleCache = hitsCache;

  const fetchPromise = (async () => {
    const hitsMap = new Map<string, number>();
    let loading = true;

    try {
      const apiUrl = siteConfig.analyticsApiUrl;
      if (!apiUrl) throw new Error("analyticsApiUrl not configured");

      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`stat API error: ${res.status}`);

      const json = (await res.json()) as { data: Array<{ page: string; hit: number }> };
      for (const item of json.data) {
        const slug = extractSlug(item.page);
        const existing = hitsMap.get(slug) ?? 0;
        hitsMap.set(slug, existing + item.hit);
      }
      loading = false;
    } catch (error) {
      console.error("[Server] Failed to fetch hits:", error);
    }

    hitsCache = { data: hitsMap, timestamp: Date.now(), loading };
    return { hitsMap, hitsLoading: loading };
  })();

  if (staleCache) {
    fetchPromise.catch(() => {});
    return { hitsMap: staleCache.data, hitsLoading: staleCache.loading };
  }

  return fetchPromise;
}

export function isKnownCategory(category: string): boolean {
  return categoryNameMap.has(category);
}

export function getCategoryName(category: string): string {
  return categoryNameMap.get(category) ?? category;
}

export async function getPostListing(params: {
  category?: string;
  pageParam?: string;
}): Promise<PostListingResult> {
  const category = params.category;
  const requestedPage = parsePositivePage(params.pageParam);
  const allPosts = getAllPosts();

  const hitsPromise = getHitsMap();

  const posts =
    category && category !== "hot"
      ? allPosts.filter((post) => post.categories.includes(category))
      : allPosts;

  const { hitsMap, hitsLoading } = await hitsPromise;

  const sortedPosts =
    category === "hot"
      ? [...posts].sort(
          (a, b) => (hitsMap.get(b.slug) ?? 0) - (hitsMap.get(a.slug) ?? 0),
        )
      : posts;

  const pageTotal = Math.max(1, Math.ceil(sortedPosts.length / articlePageSize));
  const page = Math.min(requestedPage, pageTotal);
  const start = (page - 1) * articlePageSize;

  return {
    category,
    categoryName: category ? getCategoryName(category) : undefined,
    posts: sortedPosts,
    visiblePosts: sortedPosts.slice(start, start + articlePageSize),
    hitsMap,
    hitsLoading,
    requestedPage,
    page,
    pageTotal,
  };
}
