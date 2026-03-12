import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { UIMessage } from "ai";
import type {
  ArticleContext,
  CurrentArticleContext,
  ProjectContext,
  TweetContext,
} from "@/lib/ai/chat-prompt";
import {
  buildArticleConversationQuery,
  buildArticleEvidenceQuery,
  decideArticleIntent,
  type ArticleIntentDecision,
} from "@/lib/ai/article-chat";
import {
  extractCurrentArticleQuestionFacts,
  extractRelevantArticleExcerpts,
} from "@/lib/ai/article-chat-excerpts";
import type { ChatRequestContext } from "@/lib/ai/chat-context";
import {
  cleanupSearchContextCache,
  getArticleContextBySlug,
  getArticleContextsBySlugs,
  getCachedSearchContext,
  getSessionCacheKey,
  isLikelyFollowUp,
  mergeSearchResults,
  searchRelatedArticles,
  searchRelatedProjects,
  searchRelatedTweets,
  SEARCH_CONTEXT_CACHE_TTL_MS,
  setCachedSearchContext,
} from "@/lib/ai/chat-search";
import {
  extractSearchKeywords,
  KEYWORD_EXTRACTION_TIMEOUT_MS,
  shouldRunKeywordExtractionModel,
  type QueryComplexity,
} from "@/lib/ai/keyword-extraction";
import {
  buildSearchQuery,
  getMessageText,
  hasNewSignificantTokens,
  hasSearchQueryOverlap,
} from "@/lib/ai/search-query";
import {
  durationMs,
  logChatAIDebug,
  truncateForLog,
  truncateRawTextForLog,
} from "@/lib/ai/chat-utils";
import { getPostRawContent } from "@/lib/content/posts";
import { siteConfig } from "@/lib/site-config";
import type { TokenUsageStats } from "@/lib/telegram";

function hasRecencyIntent(text: string): boolean {
  return /最近|最新|最近一次|最近一篇|最新一篇|最近公开|最新公开/u.test(
    text.trim(),
  );
}

function sortByRecency<T extends { dateTime?: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (b.dateTime ?? Number.NEGATIVE_INFINITY) - (a.dateTime ?? Number.NEGATIVE_INFINITY),
  );
}

function stripMarkdownForPrompt(content: string): string {
  const withCodePreserved = content.replace(
    /```(?:[\w-]+)?\n([\s\S]*?)```/g,
    (_match, code: string) => `\n${code.trim()}\n`,
  );

  const normalizedLines = withCodePreserved
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/`([^`]*)`/g, "$1")
        .replace(/^#{1,6}\s+/, "")
        .replace(/^\s*>\s?/, "")
        .replace(/^\s*[-*+]\s+/, "- ")
        .replace(/\s+/g, " ")
        .trim(),
    );

  const cleanedLines: string[] = [];
  let previousBlank = false;

  for (const line of normalizedLines) {
    if (!line) {
      if (!previousBlank) {
        cleanedLines.push("");
      }
      previousBlank = true;
      continue;
    }

    cleanedLines.push(line);
    previousBlank = false;
  }

  return cleanedLines.join("\n").trim();
}

export interface ResolvedCurrentArticleState {
  currentArticle?: CurrentArticleContext;
  articleConversationQuery: string;
  articleEvidenceQuery: string;
  articleIntentDecision?: ArticleIntentDecision;
  shouldUseArticleScopedFlow: boolean;
}

export function resolveCurrentArticleState(params: {
  messages: UIMessage[];
  requestContext?: ChatRequestContext;
  fullContentMaxLength: number;
}): ResolvedCurrentArticleState {
  const { messages, requestContext, fullContentMaxLength } = params;
  const latestText = getMessageText(messages[messages.length - 1]);
  const articleConversationQuery = buildArticleConversationQuery(messages);
  const articleEvidenceQuery = buildArticleEvidenceQuery(messages);
  const currentArticle = resolveCurrentArticleContext(
    requestContext,
    articleEvidenceQuery || latestText,
    fullContentMaxLength,
  );
  const articleIntentDecision = currentArticle
    ? decideArticleIntent(articleConversationQuery || latestText, currentArticle)
    : undefined;
  const shouldUseArticleScopedFlow = Boolean(
    currentArticle &&
      articleIntentDecision &&
      !articleIntentDecision.shouldSearchSiteWide,
  );

  return {
    currentArticle,
    articleConversationQuery,
    articleEvidenceQuery,
    articleIntentDecision,
    shouldUseArticleScopedFlow,
  };
}

function resolveCurrentArticleContext(
  value: ChatRequestContext | undefined,
  articleQuery: string,
  fullContentMaxLength: number,
): CurrentArticleContext | undefined {
  if (!value || value.scope !== "article") return undefined;

  const baseArticle = getArticleContextBySlug(value.article.slug, {
    fullContentMaxLength,
  });
  const rawContent = getPostRawContent(value.article.slug);
  const fullContent = rawContent
    ? stripMarkdownForPrompt(rawContent).slice(0, fullContentMaxLength)
    : baseArticle?.fullContent;
  const questionFacts = fullContent
    ? extractCurrentArticleQuestionFacts(fullContent, articleQuery)
    : [];
  const relevantExcerpts = fullContent
    ? extractRelevantArticleExcerpts(fullContent, articleQuery)
    : [];

  return {
    slug: value.article.slug,
    title: baseArticle?.title ?? value.article.title,
    url: baseArticle?.url ?? `${siteConfig.siteUrl}/${value.article.slug}`,
    summary: value.article.summary ?? baseArticle?.summary ?? "",
    abstract: value.article.abstract,
    keyPoints:
      value.article.keyPoints && value.article.keyPoints.length > 0
        ? value.article.keyPoints
        : baseArticle?.keyPoints ?? [],
    categories:
      value.article.categories && value.article.categories.length > 0
        ? value.article.categories
        : baseArticle?.categories ?? [],
    relatedSlugs: value.article.relatedSlugs ?? [],
    questionFacts,
    relevantExcerpts,
    fullContent,
  };
}

export interface ResolvedChatSearchState {
  searchQuery: string;
  relatedArticles: ArticleContext[];
  relatedTweets: TweetContext[];
  relatedProjects: ProjectContext[];
  keywordUsage?: TokenUsageStats;
  keywordExtractionMs?: number;
  searchMs: number;
  queryComplexity: QueryComplexity;
  shouldReuseSearchContext: boolean;
}

export async function resolveChatSearchState(params: {
  req: Request;
  requestId: string;
  messages: UIMessage[];
  latestText: string;
  currentArticle?: CurrentArticleContext;
  articleIntentDecision?: ArticleIntentDecision;
  shouldUseArticleScopedFlow: boolean;
  localSearchQuery: string;
  keywordModel: string;
  provider: ReturnType<typeof createOpenAICompatible>;
}): Promise<ResolvedChatSearchState> {
  const {
    req,
    requestId,
    messages,
    latestText,
    currentArticle,
    articleIntentDecision,
    shouldUseArticleScopedFlow,
    localSearchQuery,
    keywordModel,
    provider,
  } = params;
  const cacheKey = getSessionCacheKey(req);
  const now = Date.now();
  cleanupSearchContextCache(now);
  const cachedContext = cacheKey ? getCachedSearchContext(cacheKey) : undefined;
  const userTurnCount = messages.reduce(
    (count, message) => (message.role === "user" ? count + 1 : count),
    0,
  );
  const normalizedLatestQuery = localSearchQuery || buildSearchQuery(latestText);
  const currentQueryForReuseCheck = normalizedLatestQuery || latestText;
  const hasNewTopicTokens = cachedContext
    ? hasNewSignificantTokens(currentQueryForReuseCheck, cachedContext.query)
    : false;
  const shouldReuseSearchContext = Boolean(
    !shouldUseArticleScopedFlow &&
      cachedContext &&
      userTurnCount > 1 &&
      now - cachedContext.updatedAt <= SEARCH_CONTEXT_CACHE_TTL_MS &&
      isLikelyFollowUp(latestText) &&
      hasSearchQueryOverlap(currentQueryForReuseCheck, cachedContext.query) &&
      !hasNewTopicTokens,
  );

  if (shouldReuseSearchContext) {
    logChatAIDebug(requestId, "reuse-intent.rule-based", {
      latestText: truncateForLog(latestText, 120),
      decision: "SAME",
    });
  }

  let searchQuery = normalizedLatestQuery || latestText;
  let relatedArticles: ArticleContext[] = [];
  let relatedTweets: TweetContext[] = [];
  let relatedProjects: ProjectContext[] = [];
  let keywordUsage: TokenUsageStats | undefined;
  let keywordExtractionMs: number | undefined;
  let searchMs = 0;
  let queryComplexity: QueryComplexity = "moderate";

  if (shouldUseArticleScopedFlow && currentArticle && articleIntentDecision) {
    searchQuery = articleIntentDecision.queryHint || currentArticle.title;
    if (articleIntentDecision.mode === "article_extension") {
      relatedArticles = getArticleContextsBySlugs(currentArticle.relatedSlugs ?? []);
    }
    if (articleIntentDecision.mode === "article_extension" && relatedArticles.length === 0) {
      relatedArticles = searchRelatedArticles(searchQuery, true).filter(
        (article) => article.url !== currentArticle.url,
      );
    }
  } else if (shouldReuseSearchContext && cachedContext) {
    searchQuery = cachedContext.query;
    relatedArticles = cachedContext.articles;
    relatedTweets = cachedContext.tweets;
    relatedProjects = cachedContext.projects || [];
    if (cacheKey) {
      setCachedSearchContext(cacheKey, {
        ...cachedContext,
        updatedAt: now,
      });
    }
  } else {
    const runKeywordExtraction = shouldRunKeywordExtractionModel(
      messages,
      localSearchQuery,
      latestText,
    );
    const searchStart = performance.now();

    const localArticles = searchRelatedArticles(searchQuery, true);
    const localTweets = searchRelatedTweets(searchQuery);
    const localProjects = searchRelatedProjects(searchQuery);

    if (runKeywordExtraction) {
      const keywordStart = performance.now();
      const abortController = new AbortController();
      const timeoutId = setTimeout(
        () => abortController.abort(),
        KEYWORD_EXTRACTION_TIMEOUT_MS,
      );

      try {
        const keywordResult = await extractSearchKeywords(
          messages,
          provider,
          keywordModel,
          abortController.signal,
        );
        logChatAIDebug(requestId, "keyword-extraction.result", {
          parseMode: keywordResult.parseMode,
          usedFallback: keywordResult.usedFallback,
          query: keywordResult.query,
          primaryQuery: keywordResult.primaryQuery,
          rawTextLength: keywordResult.rawText?.length,
          rawText: keywordResult.rawText
            ? truncateRawTextForLog(keywordResult.rawText)
            : undefined,
          error: keywordResult.error,
        });

        const normalizedKeywordQuery = keywordResult.query || "";
        if (normalizedKeywordQuery && normalizedKeywordQuery !== searchQuery) {
          searchQuery = normalizedKeywordQuery;
          relatedArticles = searchRelatedArticles(searchQuery, true);
          relatedTweets = searchRelatedTweets(searchQuery);
          relatedProjects = searchRelatedProjects(searchQuery);

          const primaryQuery = keywordResult.primaryQuery || "";
          if (primaryQuery && primaryQuery !== searchQuery) {
            const primaryArticles = searchRelatedArticles(primaryQuery, false);
            const primaryTweets = searchRelatedTweets(primaryQuery);
            relatedArticles = mergeSearchResults(primaryArticles, relatedArticles);
            relatedTweets = mergeSearchResults(primaryTweets, relatedTweets);
          }
        } else {
          relatedArticles = localArticles;
          relatedTweets = localTweets;
          relatedProjects = localProjects;
        }

        keywordUsage = keywordResult.usage;
        queryComplexity = keywordResult.complexity;
      } catch {
        relatedArticles = localArticles;
        relatedTweets = localTweets;
        relatedProjects = localProjects;
      } finally {
        clearTimeout(timeoutId);
      }

      keywordExtractionMs = durationMs(keywordStart);
    } else {
      relatedArticles = localArticles;
      relatedTweets = localTweets;
      relatedProjects = localProjects;
    }

    const hasSearchHits = relatedArticles.length > 0 || relatedTweets.length > 0;
    const fallbackQuery = localSearchQuery || buildSearchQuery(latestText);
    if (!hasSearchHits && fallbackQuery && fallbackQuery !== searchQuery) {
      const fallbackArticles = searchRelatedArticles(fallbackQuery, true);
      const fallbackTweets = searchRelatedTweets(fallbackQuery);
      if (fallbackArticles.length > 0 || fallbackTweets.length > 0) {
        searchQuery = fallbackQuery;
        relatedArticles = fallbackArticles;
        relatedTweets = fallbackTweets;
        relatedProjects = searchRelatedProjects(fallbackQuery);
      }
    }

    if (hasRecencyIntent(latestText)) {
      relatedArticles = sortByRecency(relatedArticles);
      relatedTweets = sortByRecency(relatedTweets);
    }
    searchMs = durationMs(searchStart);

    if (cacheKey) {
      setCachedSearchContext(cacheKey, {
        query: searchQuery,
        articles: relatedArticles,
        tweets: relatedTweets,
        projects: relatedProjects,
        updatedAt: now,
      });
    }
  }

  logChatAIDebug(requestId, "search.summary", {
    hasExplicitSessionId: Boolean(cacheKey),
    currentArticleSlug: currentArticle?.slug,
    articleIntentMode: articleIntentDecision?.mode,
    articleScopedFlow: shouldUseArticleScopedFlow,
    reusedSearchContext: shouldReuseSearchContext,
    searchQuery,
    articleCount: relatedArticles.length,
    tweetCount: relatedTweets.length,
    projectCount: relatedProjects.length,
    topArticleTitles: relatedArticles.slice(0, 4).map((item) => item.title),
    topTweetTitles: relatedTweets.slice(0, 4).map((item) => item.title),
    topProjectNames: relatedProjects.slice(0, 3).map((item) => item.name),
  });

  return {
    searchQuery,
    relatedArticles,
    relatedTweets,
    relatedProjects,
    keywordUsage,
    keywordExtractionMs,
    searchMs,
    queryComplexity,
    shouldReuseSearchContext,
  };
}
