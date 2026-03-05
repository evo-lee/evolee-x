"use client";

import { useEffect, useState } from "react";
import { IconX } from "@/components/icons";
import { parseXUrl, extractTweetIdFromUrl, parseBlogUrl } from "@/lib/url-utils";
import { getCachedTweet, fetchTweetLookup } from "./chat-tweet";

/* ------------------------------------------------------------------ */
/*  Link label helpers                                                 */
/* ------------------------------------------------------------------ */

function normalizeXLinkLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "查看原文";

  const cleaned = trimmed
    .replace(/^x\s*\/\s*twitter\s*/i, "")
    .replace(/^x\s*动态\s*[：:·\-]?\s*/i, "")
    .replace(/^x\s*[：:·\-]?\s*/i, "")
    .trim();

  return cleaned || "查看原文";
}

function shouldUseTweetSnippetLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === "查看原文" || normalized === "x" || normalized === "动态") return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized);
}

function toTweetLinkSnippet(text: string, maxLength = 22): string {
  const cleaned = text
    .replace(/https?:\/\/t\.co\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "查看原文";
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength)}…`;
}

/* ------------------------------------------------------------------ */
/*  Inline link components                                             */
/* ------------------------------------------------------------------ */

function InlineBlogLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-1 text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
    >
      <img
        src="/legacy/favicon.png"
        alt=""
        className="relative top-[0.15em] h-3.5 w-3.5 shrink-0 rounded-[2px]"
      />
      <span>{label}</span>
    </a>
  );
}

function InlineTweetLink({
  href,
  label,
  tweetId,
}: {
  href: string;
  label: string;
  tweetId: string | null;
}) {
  const normalizedLabel = normalizeXLinkLabel(label);
  const shouldEnhance = Boolean(tweetId) && shouldUseTweetSnippetLabel(normalizedLabel);
  const cachedTweet = tweetId ? getCachedTweet(tweetId) : undefined;
  const [snippet, setSnippet] = useState<string | null>(
    shouldEnhance && cachedTweet?.text ? toTweetLinkSnippet(cachedTweet.text) : null,
  );

  useEffect(() => {
    if (!tweetId || !shouldEnhance || snippet) return;

    let active = true;
    fetchTweetLookup(tweetId).then((tweet) => {
      if (!active || !tweet?.text) return;
      setSnippet(toTweetLinkSnippet(tweet.text));
    });

    return () => {
      active = false;
    };
  }, [snippet, shouldEnhance, tweetId]);

  const displayLabel = shouldEnhance ? (snippet ?? normalizedLabel) : normalizedLabel;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-1 text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
    >
      <IconX className="relative top-[0.15em] h-3.5 w-3.5 shrink-0" />
      <span>{displayLabel}</span>
    </a>
  );
}

function InlineExternalLink({
  href,
  label,
  keyPrefix,
}: {
  href: string;
  label: string;
  keyPrefix: string;
}) {
  return (
    <a
      key={keyPrefix}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
    >
      <span>{label}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline markdown parser                                             */
/* ------------------------------------------------------------------ */

export interface InlineMarkdownResult {
  nodes: React.ReactNode[];
  tweetIds: string[];
}

export function renderInlineMarkdown(text: string): InlineMarkdownResult {
  const inlinePattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|(https?:\/\/[^\s）\]）]+)/g;
  const nodes: React.ReactNode[] = [];
  const tweetIds: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      const href = match[2];
      const tweetId = extractTweetIdFromUrl(href);
      if (tweetId) tweetIds.push(tweetId);

      if (parseXUrl(href)) {
        nodes.push(
          <InlineTweetLink
            key={`xl${match.index}`}
            href={href}
            label={match[1]}
            tweetId={tweetId}
          />,
        );
      } else if (parseBlogUrl(href)) {
        nodes.push(
          <InlineBlogLink
            key={`bl${match.index}`}
            href={href}
            label={match[1]}
          />,
        );
      } else {
        nodes.push(
          <InlineExternalLink
            key={`l${match.index}`}
            href={href}
            label={match[1]}
            keyPrefix={`l${match.index}`}
          />,
        );
      }
    } else if (match[3] !== undefined) {
      nodes.push(
        <strong
          key={`b${match.index}`}
          className="font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {match[3]}
        </strong>,
      );
    } else if (match[4] !== undefined) {
      const href = match[4];
      const tweetId = extractTweetIdFromUrl(href);
      if (tweetId) tweetIds.push(tweetId);

      if (parseXUrl(href)) {
        nodes.push(
          <InlineTweetLink
            key={`xb${match.index}`}
            href={href}
            label={href}
            tweetId={tweetId}
          />,
        );
      } else if (parseBlogUrl(href)) {
        nodes.push(
          <InlineBlogLink
            key={`bb${match.index}`}
            href={href}
            label={href.replace(/^https?:\/\/(www\.)?/, "")}
          />,
        );
      } else {
        nodes.push(
          <InlineExternalLink
            key={`lb${match.index}`}
            href={href}
            label={href.replace(/^https?:\/\/(www\.)?/, "")}
            keyPrefix={`lb${match.index}`}
          />,
        );
      }
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return { nodes, tweetIds };
}
