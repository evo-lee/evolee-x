"use client";

import { useState } from "react";
import type { UIMessage } from "ai";
import { ChevronDown } from "lucide-react";
import { MAX_TWEET_CARDS_PER_MESSAGE } from "@/lib/constants";
import { IconX } from "@/components/icons";
import { renderInlineMarkdown } from "./chat-markdown";
import { ChatTweetCard } from "./chat-tweet";
import { AuthorAvatar } from "./chat-avatar";

export function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function MessageContent({ message }: { message: UIMessage }) {
  const text = getTextFromMessage(message);
  const [showTweetCards, setShowTweetCards] = useState(false);
  if (!text) return null;

  const paragraphs = text.split("\n").filter((line) => line.trim());
  const parsedParagraphs = paragraphs.map((paragraph) => renderInlineMarkdown(paragraph));

  const tweetCards: string[] = [];
  if (message.role === "assistant") {
    const seenTweetIds = new Set<string>();
    for (const parsed of parsedParagraphs) {
      for (const tweetId of parsed.tweetIds) {
        if (tweetCards.length >= MAX_TWEET_CARDS_PER_MESSAGE) break;
        if (seenTweetIds.has(tweetId)) continue;
        seenTweetIds.add(tweetId);
        tweetCards.push(tweetId);
      }
      if (tweetCards.length >= MAX_TWEET_CARDS_PER_MESSAGE) break;
    }
  }

  return (
    <div className="space-y-2 text-[14px] leading-relaxed">
      {parsedParagraphs.map((parsed, index) => (
        <p key={index}>{parsed.nodes}</p>
      ))}
      {tweetCards.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowTweetCards((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[12px] text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
          >
            <IconX className="h-3.5 w-3.5" />
            <span>X 引用（{tweetCards.length}）</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showTweetCards ? "rotate-180" : ""}`}
            />
          </button>

          {showTweetCards && (
            <div className="mt-2 space-y-2">
              {tweetCards.map((tweetId) => (
                <ChatTweetCard key={tweetId} tweetId={tweetId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TypingIndicator({ statusMessage }: { statusMessage?: string }) {
  return (
    <div className="flex items-start gap-3">
      <AuthorAvatar size={28} />
      <div className="flex items-center gap-1.5 pt-2">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
        {statusMessage && (
          <span className="ml-1 text-[12px] text-zinc-400 dark:text-zinc-500">
            {statusMessage}
          </span>
        )}
      </div>
    </div>
  );
}
