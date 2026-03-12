"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  Sparkles,
} from "lucide-react";
import { dismissArticleChat } from "@/lib/ai/article-chat-state";
import { getPageScrollProgress } from "@/lib/browser/scroll-progress";
import {
  getChatEntryContextKey,
  isArticleChatEntryContext,
  toChatRequestContext,
  type ChatEntryContext,
} from "@/lib/ai/chat-context";
import { isChatStatusData, type ChatStatusData } from "@/lib/ai/chat-status";
import { useMediaQuery } from "@/hooks/use-media-query";
import { siteConfig } from "@/lib/site-config";
import { ArticleChatLauncher } from "@/components/chat/article-chat-launcher";
import { AuthorAvatar } from "@/components/chat/chat-avatar";
import { parseChatErrorInfo } from "@/components/chat/chat-error";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useAIChat } from "./ai-chat-provider";

const PLACEHOLDERS = siteConfig.ai.placeholders;
const MOBILE_LAUNCHER_MEDIA_QUERY = "(max-width: 639px)";
const MOBILE_LAUNCHER_MIN_PROGRESS = 0.08;
const MOBILE_LAUNCHER_DELAY_MS = 1200;

function buildWelcomeMessage(entryContext: ChatEntryContext): UIMessage {
  if (!isArticleChatEntryContext(entryContext)) {
    return {
      id: "welcome",
      role: "assistant",
      parts: [{ type: "text", text: siteConfig.ai.welcomeText }],
    };
  }

  const article = entryContext.article;
  return {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: `我在结合《${article.title}》陪你阅读。\n你可以让我总结这篇文章、解释某个观点，或者顺着这篇文章继续延伸到相关主题。`,
      },
    ],
  };
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function AIChatBox() {
  const {
    open,
    setOpen,
    entryContext,
    hasUserInteracted,
    markUserInteracted,
  } = useAIChat();
  const chatInstanceId = useMemo(() => getChatEntryContextKey(entryContext), [entryContext]);
  const sessionId = useMemo(
    () => `${chatInstanceId}:${generateSessionId()}`,
    [chatInstanceId],
  );
  const isCompactViewport = useMediaQuery(MOBILE_LAUNCHER_MEDIA_QUERY);
  const [mobileLauncherReadySlug, setMobileLauncherReadySlug] = useState<string | null>(null);
  const sendLockRef = useRef(false);
  const [dismissedStarterState, setDismissedStarterState] = useState<{
    contextKey: string;
    questions: string[];
  }>({
    contextKey: "",
    questions: [],
  });

  const sessionTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: { "x-session-id": sessionId },
        body: { context: toChatRequestContext(entryContext) },
      }),
    [entryContext, sessionId],
  );

  const { messages, sendMessage, status, setMessages, error, clearError } = useChat({
    // useChat does not rebuild its internal Chat when transport/body changes alone.
    // Re-key the instance by entry context so article-scoped first turns use the right payload.
    id: chatInstanceId,
    transport: sessionTransport,
    messages: [buildWelcomeMessage(entryContext)],
  });

  useEffect(() => {
    if (hasUserInteracted) return;
    setMessages([buildWelcomeMessage(entryContext)]);
    clearError();
  }, [clearError, entryContext, hasUserInteracted, setMessages]);

  const isSending = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!isSending) {
      sendLockRef.current = false;
    }
  }, [isSending]);

  const errorInfo = parseChatErrorInfo(error);
  const dismissedStarterQuestions =
    dismissedStarterState.contextKey === chatInstanceId ? dismissedStarterState.questions : [];

  const latestStatusData = useMemo<ChatStatusData | undefined>(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role === "assistant" && isChatStatusData(message.metadata)) {
        return message.metadata;
      }
    }
    return undefined;
  }, [messages]);

  const handleSend = useCallback(
    (params: { text: string }) => {
      if (sendLockRef.current || isSending) return;
      sendLockRef.current = true;
      markUserInteracted();
      if (error) clearError();
      sendMessage(params);
    },
    [clearError, error, isSending, markUserInteracted, sendMessage],
  );

  const handleClear = useCallback(() => {
    setMessages([buildWelcomeMessage(entryContext)]);
    setDismissedStarterState({
      contextKey: chatInstanceId,
      questions: [],
    });
    clearError();
  }, [chatInstanceId, clearError, entryContext, setMessages]);

  const handleSelectStarterQuestion = useCallback(
    (question: string) => {
      if (sendLockRef.current || isSending) return;
      setDismissedStarterState((current) => {
        const baseQuestions = current.contextKey === chatInstanceId ? current.questions : [];
        return {
          contextKey: chatInstanceId,
          questions: baseQuestions.includes(question) ? baseQuestions : [...baseQuestions, question],
        };
      });
      handleSend({ text: question });
    },
    [chatInstanceId, handleSend, isSending],
  );

  const handleClose = useCallback(() => {
    if (isArticleChatEntryContext(entryContext) && !hasUserInteracted && !isCompactViewport) {
      dismissArticleChat(entryContext.article.slug);
      setMobileLauncherReadySlug(null);
    }
    setOpen(false);
  }, [entryContext, hasUserInteracted, isCompactViewport, setOpen]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.role !== "system"),
    [messages],
  );

  const articleContext = isArticleChatEntryContext(entryContext) ? entryContext.article : null;
  const articleSlug = articleContext?.slug ?? null;

  useEffect(() => {
    if (!articleContext?.slug || !isCompactViewport || hasUserInteracted) return;

    let disposed = false;
    let delayReady = false;
    let progressReady = getPageScrollProgress() >= MOBILE_LAUNCHER_MIN_PROGRESS;

    const revealLauncher = () => {
      if (disposed || !delayReady || !progressReady) return;
      setMobileLauncherReadySlug(articleContext.slug);
      window.removeEventListener("scroll", handleScroll);
    };

    const handleScroll = () => {
      progressReady = getPageScrollProgress() >= MOBILE_LAUNCHER_MIN_PROGRESS;
      revealLauncher();
    };

    const timerId = window.setTimeout(() => {
      delayReady = true;
      revealLauncher();
    }, MOBILE_LAUNCHER_DELAY_MS);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      disposed = true;
      window.clearTimeout(timerId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [articleContext, hasUserInteracted, isCompactViewport]);

  const showDesktopLauncher = Boolean(articleContext) && !open && !isCompactViewport;
  const showMobileLauncher =
    Boolean(articleContext) &&
    !open &&
    isCompactViewport &&
    (hasUserInteracted || mobileLauncherReadySlug === articleSlug);

  return (
    <>
      {showDesktopLauncher && articleContext && (
        <ArticleChatLauncher
          articleTitle={articleContext.title}
          openingLine={articleContext.openingLine}
          onOpen={() => setOpen(true)}
        />
      )}
      {showMobileLauncher && articleContext && (
        <ArticleChatLauncher articleTitle={articleContext.title} onOpen={() => setOpen(true)} compact />
      )}
      <ChatPanel
        open={open}
        onClose={handleClose}
        visibleMessages={visibleMessages}
        sendMessage={handleSend}
        status={status}
        error={error}
        errorInfo={errorInfo}
        onClear={handleClear}
        latestStatusData={latestStatusData}
        entryContext={entryContext}
        dismissedStarterQuestions={dismissedStarterQuestions}
        onSelectStarterQuestion={handleSelectStarterQuestion}
        isSending={isSending}
      />
    </>
  );
}

export function AIChatTrigger() {
  const { open, setOpen, resetEntryContext } = useAIChat();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-1 pt-0 sm:px-4 md:px-6 lg:px-2">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => {
            resetEntryContext();
            setOpen(true);
          }}
          className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-200/60 bg-zinc-50/40 px-3.5 py-2.5 text-left transition-all hover:border-zinc-300/80 hover:bg-zinc-100/50 hover:shadow-sm dark:border-zinc-700/40 dark:bg-zinc-800/20 dark:hover:border-zinc-600/60 dark:hover:bg-zinc-800/40"
        >
          <AuthorAvatar size={32} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
              Hi，我是{siteConfig.author.name}的{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {siteConfig.ai.triggerLabel}
              </span>
              ，{siteConfig.ai.triggerText}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
              {PLACEHOLDERS[placeholderIndex]}
            </p>
          </div>
          {open ? (
            <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
              对话中
            </span>
          ) : (
            <Sparkles className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-violet-400 dark:text-zinc-600 dark:group-hover:text-violet-400" />
          )}
        </button>
      </div>
    </div>
  );
}
