import {
  createSearchIndex,
  searchDocuments,
  type SearchDocument,
  type SearchIndexedDocument,
} from "@luoleiorg/search-core";
import { getSearchDocuments } from "@/lib/content/posts";
import { getAISummary } from "@/lib/content/ai-data";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

let cachedDocs: SearchDocument[] | null = null;
let cachedIndex: SearchIndexedDocument[] | null = null;

function toSafeLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(value)));
}

function loadSearchData() {
  // Use cached data if available
  if (cachedDocs && cachedIndex) {
    return { docs: cachedDocs, index: cachedIndex };
  }

  // Generate search documents from posts
  const docs = getSearchDocuments();
  const index = createSearchIndex(docs);

  cachedDocs = docs;
  cachedIndex = index;

  return { docs, index };
}

function toPayload(item: SearchDocument) {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    cover: item.cover ?? "",
    excerpt: item.excerpt,
    content: item.content.slice(0, 320),
    categories: item.categories,
    dateTime: item.dateTime,
    keyPoints: item.keyPoints ?? [],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const limit = toSafeLimit(Number(searchParams.get("limit") ?? DEFAULT_LIMIT));

  const { docs, index } = loadSearchData();
  const relatedSlug = searchParams.get("related") ?? "";

  // 无搜索词 + 指定关联文章 → 基于 AI 语义数据推荐相关文章
  if (!query.trim() && relatedSlug) {
    const aiSummary = getAISummary(relatedSlug);
    const currentDoc = docs.find((d) => d.id === relatedSlug);

    const queryTerms: string[] = [];
    if (aiSummary?.tags) queryTerms.push(...aiSummary.tags);
    if (currentDoc?.categories) queryTerms.push(...currentDoc.categories);
    if (aiSummary?.keyPoints) queryTerms.push(...aiSummary.keyPoints.slice(0, 3));

    const semanticQuery = queryTerms.join(" ");

    if (semanticQuery) {
      const related = searchDocuments(index, semanticQuery, limit + 1)
        .filter((item) => item.id !== relatedSlug)
        .slice(0, limit)
        .map((item) => ({ ...toPayload(item), score: item.score }));

      return Response.json({
        query: "",
        related: relatedSlug,
        total: related.length,
        results: related,
      });
    }
  }

  if (!query.trim()) {
    const latest = docs
      .slice()
      .sort((a, b) => b.dateTime - a.dateTime)
      .slice(0, limit)
      .map((item) => ({ ...toPayload(item), score: 0 }));

    return Response.json({
      query,
      total: latest.length,
      results: latest,
    });
  }

  const results = searchDocuments(index, query, limit).map((item) => ({
    ...toPayload(item),
    score: item.score,
  }));

  return Response.json({
    query,
    total: results.length,
    results,
  });
}
