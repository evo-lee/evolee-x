import tweetsCache from "@/../data/tweets-cache.json";

export interface TweetMetrics {
  bookmark_count?: number;
  like_count?: number;
  quote_count?: number;
  reply_count?: number;
  retweet_count?: number;
}

export interface CachedTweetCardMedia {
  preview_image_url?: string;
  type?: string;
  url?: string;
}

export interface CachedTweetCardAuthor {
  name?: string;
  profile_image_url?: string;
  username?: string;
}

export interface CachedTweetCard {
  author?: CachedTweetCardAuthor;
  created_at?: string;
  id: string;
  media?: CachedTweetCardMedia[];
  public_metrics?: TweetMetrics | null;
  text?: string;
}

interface TweetCardCache {
  tweets?: Record<string, CachedTweetCard | undefined>;
}

function getTweetCardCache(): TweetCardCache {
  return tweetsCache as TweetCardCache;
}

export function getTweetCardById(tweetId: string): CachedTweetCard | undefined {
  return getTweetCardCache().tweets?.[tweetId];
}

export function getAllTweetCardEntries(): CachedTweetCard[] {
  return Object.values(getTweetCardCache().tweets ?? {}).filter(
    (tweet): tweet is CachedTweetCard => Boolean(tweet?.id),
  );
}
