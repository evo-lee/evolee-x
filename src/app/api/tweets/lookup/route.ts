import authorTweetsCache from "@/../data/author-tweets-cache.json";
import {
  getAllTweetCardEntries,
  type TweetMetrics,
} from "@/lib/content/tweet-card-cache";
import { getProxiedImage } from "@/lib/image-proxy";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

interface TweetLookupItem {
  id: string;
  text: string;
  createdAt: string;
  url: string;
  author: {
    name: string;
    username: string;
    profileImageUrl?: string;
  };
  metrics: {
    replyCount: number;
    likeCount: number;
    retweetCount: number;
    quoteCount: number;
    bookmarkCount: number;
  };
  media: string[];
}

interface AuthorTweet {
  id: string;
  text?: string;
  created_at?: string;
  public_metrics?: TweetMetrics | null;
  media?: Array<{
    type?: string;
    url?: string;
    preview_image_url?: string;
  }>;
}

interface AuthorTweetsCache {
  user?: {
    username?: string;
    name?: string;
    profile_image_url?: string;
  };
  tweets?: AuthorTweet[];
}

let cachedLookup: Map<string, TweetLookupItem> | null = null;

function normalizeMetrics(metrics?: TweetMetrics | null): TweetLookupItem["metrics"] {
  return {
    replyCount: Number(metrics?.reply_count ?? 0),
    likeCount: Number(metrics?.like_count ?? 0),
    retweetCount: Number(metrics?.retweet_count ?? 0),
    quoteCount: Number(metrics?.quote_count ?? 0),
    bookmarkCount: Number(metrics?.bookmark_count ?? 0),
  };
}

function collectMediaUrls(
  media?: Array<{
    type?: string;
    url?: string;
    preview_image_url?: string;
  }>,
): string[] {
  if (!Array.isArray(media)) return [];
  return media
    .filter((item) => item?.type === "photo")
    .map((item) => getProxiedImage(item.preview_image_url || item.url || "", "w=1200"))
    .filter(Boolean);
}

function buildLookupMap(): Map<string, TweetLookupItem> {
  if (cachedLookup) return cachedLookup;

  const map = new Map<string, TweetLookupItem>();

  const authorCache = authorTweetsCache as AuthorTweetsCache;
  const username = authorCache.user?.username ?? siteConfig.author.twitterUsername;
  const name = authorCache.user?.name ?? username;
  const profileImageUrl = authorCache.user?.profile_image_url;

  for (const tweet of authorCache.tweets ?? []) {
    if (!tweet.id || !tweet.text || !tweet.created_at) continue;
    map.set(tweet.id, {
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      url: `https://x.com/${username}/status/${tweet.id}`,
      author: {
        name,
        username,
        profileImageUrl: getProxiedImage(profileImageUrl, "w=120"),
      },
      metrics: normalizeMetrics(tweet.public_metrics),
      media: collectMediaUrls(tweet.media),
    });
  }

  for (const tweet of getAllTweetCardEntries()) {
    if (!tweet.text || !tweet.created_at) continue;
    if (map.has(tweet.id)) continue;
    const cardUsername = tweet.author?.username ?? username;
    map.set(tweet.id, {
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      url: `https://x.com/${cardUsername}/status/${tweet.id}`,
      author: {
        name: tweet.author?.name ?? name,
        username: cardUsername,
        profileImageUrl: getProxiedImage(
          tweet.author?.profile_image_url ?? profileImageUrl,
          "w=120",
        ),
      },
      metrics: normalizeMetrics(tweet.public_metrics),
      media: collectMediaUrls(tweet.media),
    });
  }

  cachedLookup = map;
  return map;
}

function isValidTweetId(id: string): boolean {
  return /^\d{8,32}$/.test(id);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = (searchParams.get("id") ?? "").trim();

  if (!isValidTweetId(id)) {
    return Response.json({ error: "invalid_tweet_id" }, { status: 400 });
  }

  const lookup = buildLookupMap();
  const tweet = lookup.get(id);
  if (!tweet) {
    return Response.json({ error: "tweet_not_found" }, { status: 404 });
  }

  return Response.json(tweet, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
