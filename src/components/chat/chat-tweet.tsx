"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";
import { IconX } from "@/components/icons";
import { formatTweetDate, formatCompactNumber } from "@/lib/tweet-utils";

export interface ChatTweetLookup {
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
  };
  media: string[];
}

/* ------------------------------------------------------------------ */
/*  Lookup cache & helpers                                             */
/* ------------------------------------------------------------------ */

const tweetLookupCache = new Map<string, ChatTweetLookup>();

export function getCachedTweet(tweetId: string): ChatTweetLookup | undefined {
  return tweetLookupCache.get(tweetId);
}

export async function fetchTweetLookup(tweetId: string): Promise<ChatTweetLookup | null> {
  if (tweetLookupCache.has(tweetId)) {
    return tweetLookupCache.get(tweetId) ?? null;
  }

  try {
    const res = await fetch(`/api/tweets/lookup?id=${encodeURIComponent(tweetId)}`);
    if (res.ok) {
      const payload = (await res.json()) as ChatTweetLookup;
      tweetLookupCache.set(tweetId, payload);
      return payload;
    }
  } catch {
    return null;
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

export function ChatTweetMediaGrid({
  images,
  tweetUrl,
}: {
  images: string[];
  tweetUrl: string;
}) {
  const displayImages = images.slice(0, 4);
  const count = displayImages.length;
  if (count === 0) return null;

  const renderImage = (src: string, className: string, sizes: string) => (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt="Tweet media"
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-300 hover:scale-[1.02]"
      />
    </div>
  );

  const wrapLink = (children: React.ReactNode, className: string) => (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/60"
    >
      <div className={className}>{children}</div>
    </a>
  );

  if (count === 1) {
    return wrapLink(
      renderImage(displayImages[0], "h-full", "(max-width: 768px) 100vw, 36rem"),
      "aspect-[16/10]",
    );
  }

  if (count === 2) {
    return wrapLink(
      <>
        {renderImage(displayImages[0], "h-full", "(max-width: 768px) 50vw, 18rem")}
        {renderImage(displayImages[1], "h-full", "(max-width: 768px) 50vw, 18rem")}
      </>,
      "grid grid-cols-2 gap-px aspect-[16/10]",
    );
  }

  if (count === 3) {
    return wrapLink(
      <>
        {renderImage(displayImages[0], "row-span-2 h-full", "(max-width: 768px) 50vw, 18rem")}
        {renderImage(displayImages[1], "h-full", "(max-width: 768px) 25vw, 9rem")}
        {renderImage(displayImages[2], "h-full", "(max-width: 768px) 25vw, 9rem")}
      </>,
      "grid grid-cols-2 grid-rows-2 gap-px aspect-[16/10]",
    );
  }

  return wrapLink(
    <>
      {displayImages.map((src, index) => (
        <div key={index} className="contents">
          {renderImage(src, "h-full", "(max-width: 768px) 50vw, 18rem")}
        </div>
      ))}
    </>,
    "grid grid-cols-2 grid-rows-2 gap-px aspect-[16/10]",
  );
}

export function ChatTweetCard({ tweetId }: { tweetId: string }) {
  const initialCachedTweet = tweetLookupCache.get(tweetId);
  const [tweet, setTweet] = useState<ChatTweetLookup | null>(initialCachedTweet ?? null);
  const [loaded, setLoaded] = useState(Boolean(initialCachedTweet));

  useEffect(() => {
    let active = true;
    if (loaded) return () => { active = false; };

    fetchTweetLookup(tweetId).then((payload) => {
      if (!active) return;
      setTweet(payload);
      setLoaded(true);
    });

    return () => {
      active = false;
    };
  }, [loaded, tweetId]);

  if (!loaded || !tweet) return null;

  return (
    <div className="mt-2 w-full max-w-[36rem] rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {tweet.author.profileImageUrl ? (
            <Image
              src={tweet.author.profileImageUrl}
              alt={tweet.author.name}
              width={28}
              height={28}
              sizes="28px"
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {tweet.author.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-zinc-800 dark:text-zinc-100">
              {tweet.author.name}
            </p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              @{tweet.author.username}
            </p>
          </div>
        </div>
        <a
          href={tweet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          aria-label="在 X 打开"
        >
          <IconX className="h-4 w-4" />
        </a>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-200">
        {tweet.text}
      </p>

      {tweet.media.length > 0 && (
        <div className="mt-2">
          <ChatTweetMediaGrid images={tweet.media} tweetUrl={tweet.url} />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>{formatTweetDate(tweet.createdAt)}</span>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {formatCompactNumber(tweet.metrics.replyCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Repeat2 className="h-3 w-3" />
            {formatCompactNumber(tweet.metrics.retweetCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {formatCompactNumber(tweet.metrics.likeCount)}
          </span>
        </div>
      </div>
    </div>
  );
}
