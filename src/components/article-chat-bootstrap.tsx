"use client";

import { useEffect } from "react";
import type { ArticleChatContext } from "@/lib/ai/chat-context";
import { hasArticleChatAutoOpened, isArticleChatDismissed, markArticleChatAutoOpened } from "@/lib/ai/article-chat-state";
import { getPageScrollProgress } from "@/lib/browser/scroll-progress";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAIChat } from "./ai-chat-provider";

const DESKTOP_AUTO_OPEN_MEDIA = "(min-width: 1280px)";
const MIN_SCROLL_PROGRESS = 0.12;

interface ArticleChatBootstrapProps {
  guide: ArticleChatContext;
}

export function ArticleChatBootstrap({ guide }: ArticleChatBootstrapProps) {
  const {
    open,
    setOpen,
    setEntryContext,
    resetEntryContext,
    hasUserInteracted,
  } = useAIChat();
  const isDesktopViewport = useMediaQuery(DESKTOP_AUTO_OPEN_MEDIA);

  useEffect(() => {
    setEntryContext({ scope: "article", article: guide });
  }, [guide, setEntryContext]);

  useEffect(() => {
    return () => {
      setOpen(false);
      resetEntryContext();
    };
  }, [resetEntryContext, setOpen]);

  useEffect(() => {
    if (!guide.autoOpenEnabled) return;
    if (!guide.slug) return;
    if (open || hasUserInteracted) return;
    if (!isDesktopViewport) return;
    if (isArticleChatDismissed(guide.slug) || hasArticleChatAutoOpened(guide.slug)) return;

    let disposed = false;
    let delayReady = false;
    let progressReady = getPageScrollProgress() >= MIN_SCROLL_PROGRESS;

    const tryOpen = () => {
      if (disposed || open || hasUserInteracted) return;
      if (!delayReady || !progressReady) return;

      markArticleChatAutoOpened(guide.slug);
      setOpen(true);
      disposed = true;
      window.removeEventListener("scroll", handleScroll);
    };

    const handleScroll = () => {
      progressReady = getPageScrollProgress() >= MIN_SCROLL_PROGRESS;
      tryOpen();
    };

    const timerId = window.setTimeout(() => {
      delayReady = true;
      tryOpen();
    }, guide.autoOpenDelayMs ?? 7000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      disposed = true;
      window.clearTimeout(timerId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    guide.autoOpenDelayMs,
    guide.autoOpenEnabled,
    guide.slug,
    hasUserInteracted,
    isDesktopViewport,
    open,
    setOpen,
  ]);

  return null;
}
