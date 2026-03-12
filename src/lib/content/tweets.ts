import { cache } from "react";
import type { SearchDocument } from "@luoleiorg/search-core";
import authorTweetsCache from "@/../data/author-tweets-cache.json";
import {
  getAllTweetCardEntries,
  type TweetMetrics,
} from "@/lib/content/tweet-card-cache";

const DEFAULT_USERNAME = "luoleiorg";
const MAX_SEARCHABLE_TWEET_LENGTH = 1600;

interface AuthorTimelineTweet {
  id: string;
  text?: string;
  created_at?: string;
  public_metrics?: TweetMetrics | null;
}

interface AuthorTimelineCache {
  meta?: {
    username?: string;
  };
  user?: {
    username?: string;
  };
  tweets?: AuthorTimelineTweet[];
}

function normalizeTweetText(text: string): string {
  return text
    .replace(/https?:\/\/t\.co\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDateTime(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value?: string): string {
  if (!value) return "未知日期";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "未知日期";
  return parsed.toISOString().slice(0, 10);
}

function buildKeyPoints(metrics?: TweetMetrics | null): string[] {
  if (!metrics) return [];
  const likeCount = Number(metrics.like_count ?? 0);
  const retweetCount = Number(metrics.retweet_count ?? 0);
  const replyCount = Number(metrics.reply_count ?? 0);
  const quoteCount = Number(metrics.quote_count ?? 0);
  const bookmarkCount = Number(metrics.bookmark_count ?? 0);

  const keyPoints: string[] = [];
  if (likeCount > 0) keyPoints.push(`点赞 ${likeCount}`);
  if (retweetCount > 0) keyPoints.push(`转推 ${retweetCount}`);
  if (replyCount > 0) keyPoints.push(`回复 ${replyCount}`);
  if (quoteCount > 0) keyPoints.push(`引用 ${quoteCount}`);
  if (bookmarkCount > 0) keyPoints.push(`收藏 ${bookmarkCount}`);
  return keyPoints;
}

function toSearchDocument(params: {
  id: string;
  text?: string;
  createdAt?: string;
  username?: string;
  metrics?: TweetMetrics | null;
}): SearchDocument | null {
  const normalizedText = normalizeTweetText(params.text ?? "");
  if (!params.id || !normalizedText) return null;

  const username = (params.username ?? DEFAULT_USERNAME).trim() || DEFAULT_USERNAME;
  const dateLabel = formatDate(params.createdAt);
  const content = normalizedText.slice(0, MAX_SEARCHABLE_TWEET_LENGTH);

  return {
    id: `tweet:${params.id}`,
    title: `X 动态 · ${dateLabel}`,
    url: `https://x.com/${username}/status/${params.id}`,
    excerpt: normalizedText.slice(0, 220),
    content,
    categories: ["x", "twitter", "tweet", "social", username.toLowerCase()],
    dateTime: toDateTime(params.createdAt),
    keyPoints: buildKeyPoints(params.metrics),
  };
}

function getPrimaryUsername(): string {
  const cache = authorTweetsCache as AuthorTimelineCache;
  const username = cache.user?.username ?? cache.meta?.username ?? DEFAULT_USERNAME;
  return username.trim() || DEFAULT_USERNAME;
}

function getAuthorTimelineDocuments(): SearchDocument[] {
  const cache = authorTweetsCache as AuthorTimelineCache;
  const username = getPrimaryUsername();
  const tweets = Array.isArray(cache.tweets) ? cache.tweets : [];

  return tweets
    .map((tweet) =>
      toSearchDocument({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        username,
        metrics: tweet.public_metrics,
      }))
    .filter((doc): doc is SearchDocument => doc !== null);
}

function getTweetCardDocuments(existingIds: Set<string>): SearchDocument[] {
  const primaryUsername = getPrimaryUsername().toLowerCase();
  const entries = getAllTweetCardEntries();

  const docs: SearchDocument[] = [];
  for (const tweet of entries) {
    if (existingIds.has(tweet.id)) continue;
    const username = (tweet.author?.username ?? primaryUsername).toLowerCase();
    if (username !== primaryUsername) continue;

    const doc = toSearchDocument({
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      username,
      metrics: tweet.public_metrics,
    });
    if (doc) {
      docs.push(doc);
      existingIds.add(tweet.id);
    }
  }

  return docs;
}

export const getTweetSearchDocuments = cache((): SearchDocument[] => {
  const authorDocs = getAuthorTimelineDocuments();
  const existingIds = new Set(
    authorDocs
      .map((doc) => doc.id.replace(/^tweet:/, ""))
      .filter(Boolean),
  );
  const cardDocs = getTweetCardDocuments(existingIds);

  return [...authorDocs, ...cardDocs].sort((a, b) => b.dateTime - a.dateTime);
});
