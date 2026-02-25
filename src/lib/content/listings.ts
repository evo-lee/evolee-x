import { API_PAGE_HITS, type PageHitItem } from "@/lib/analytics";
import { articlePageSize, categoryMap } from "@/lib/site-config";
import { getAllPosts } from "./posts";
import type { PostItem } from "./types";

const categoryNameMap = new Map<string, string>(
  categoryMap.map((item) => [item.text, item.name]),
);

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

function parsePageNumber(pageParam?: string): number {
  if (!pageParam) return 1;
  const parsed = Number(pageParam);
  if (!Number.isFinite(parsed)) return 1;
  const integer = Math.trunc(parsed);
  return integer > 0 ? integer : 1;
}

async function getHitsMap(): Promise<{
  hitsMap: Map<string, number>;
  hitsLoading: boolean;
}> {
  const hitsMap = new Map<string, number>();

  try {
    const hitsRes = await fetch(API_PAGE_HITS, { cache: "no-store" });
    const hitsJson = (await hitsRes.json()) as { data?: PageHitItem[] };
    for (const item of hitsJson.data ?? []) {
      hitsMap.set(item.page.replace(/^\//, ""), item.hit);
    }

    return { hitsMap, hitsLoading: false };
  } catch {
    return { hitsMap, hitsLoading: true };
  }
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
  const requestedPage = parsePageNumber(params.pageParam);
  const allPosts = getAllPosts();
  const { hitsMap, hitsLoading } = await getHitsMap();

  const posts =
    category && category !== "hot"
      ? allPosts.filter((post) => post.categories.includes(category))
      : allPosts;

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
