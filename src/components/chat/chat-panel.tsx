"use client";

import { createPortal } from "react-dom";
import type { UIMessage } from "ai";
import {
  Sparkles,
  Send,
  RotateCcw,
  Loader2,
  Minimize2,
} from "lucide-react";
import type { ChatEntryContext } from "@/lib/ai/chat-context";
import { isArticleChatEntryContext } from "@/lib/ai/chat-context";
import type { ChatStatusData } from "@/lib/ai/chat-status";
import { siteConfig } from "@/lib/site-config";
import { AuthorAvatar } from "./chat-avatar";
import { type ChatErrorInfo } from "./chat-error";
import { ArticleStarterCards } from "./chat-starter-cards";
import { getTextFromMessage, MessageContent, TypingIndicator } from "./chat-message";
import { useChatPanelController } from "./use-chat-panel-controller";

export interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  visibleMessages: UIMessage[];
  sendMessage: (params: { text: string }) => void;
  status: string;
  error: Error | undefined;
  errorInfo: ChatErrorInfo | null;
  onClear: () => void;
  latestStatusData?: ChatStatusData;
  entryContext: ChatEntryContext;
  dismissedStarterQuestions: string[];
  onSelectStarterQuestion: (question: string) => void;
  isSending: boolean;
}

export function ChatPanel({
  open,
  onClose,
  visibleMessages,
  sendMessage,
  status,
  error,
  errorInfo,
  onClear,
  latestStatusData,
  entryContext,
  dismissedStarterQuestions,
  onSelectStarterQuestion,
  isSending,
}: ChatPanelProps) {
  const articleContext = isArticleChatEntryContext(entryContext) ? entryContext : null;
  const {
    cooldown,
    handleKeyDown,
    handleSend,
    hasEntered,
    input,
    inputRef,
    isDockedDesktop,
    isLoading,
    messagesEndRef,
    panelRef,
    setInput,
  } = useChatPanelController({
    open,
    entryContext,
    visibleMessages,
    status,
    sendMessage,
  });
  const lastVisibleMessage = visibleMessages[visibleMessages.length - 1];
  const hasPendingAssistantPlaceholder =
    status === "streaming" &&
    lastVisibleMessage?.role === "assistant" &&
    getTextFromMessage(lastVisibleMessage).trim().length === 0;
  const shouldShowTypingIndicator = status === "submitted" || hasPendingAssistantPlaceholder;

  if (!open || typeof document === "undefined") return null;

  const panelBaseClassName = isDockedDesktop
    ? "fixed bottom-4 right-4 z-101 flex h-[min(72vh,760px)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white will-change-transform dark:border-zinc-700 dark:bg-zinc-900"
    : "fixed top-0 left-0 z-101 flex h-full w-screen flex-col overflow-hidden bg-white will-change-transform sm:bottom-auto sm:left-1/2 sm:top-[12%] sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:border-zinc-200 dark:bg-zinc-900 sm:dark:border-zinc-700";
  const panelAnimationClassName = isDockedDesktop
    ? hasEntered
      ? "translate-y-0 scale-100 opacity-100 shadow-2xl"
      : "translate-y-5 scale-[0.96] opacity-0 shadow-lg"
    : hasEntered
      ? "translate-y-0 scale-100 opacity-100 sm:translate-y-0 sm:scale-100 sm:shadow-2xl"
      : "translate-y-6 scale-[0.985] opacity-0 sm:translate-y-3 sm:scale-[0.985] sm:shadow-xl";
  const panelClassName = `${panelBaseClassName} ${panelAnimationClassName} origin-bottom-right transition-[opacity,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isDockedDesktop ? "" : "sm:origin-center"}`;
  const contentMaxWidthClass = isDockedDesktop ? "max-w-none" : "max-w-xl";
  const panelTitle = articleContext ? "边读边聊" : siteConfig.author.name;
  const panelSubtitle = articleContext
    ? "围绕当前文章继续追问、拆解和延伸"
    : `${siteConfig.ai.chatTitle} · ${siteConfig.ai.chatSubtitle}`;

  return createPortal(
    <>
      {!isDockedDesktop && (
        <div
          className={`fixed inset-0 z-100 bg-black/30 backdrop-blur-[2px] transition-opacity duration-250 ease-out motion-reduce:transition-none ${
            hasEntered ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
          style={{ touchAction: "none" }}
        />
      )}
      <div ref={panelRef} data-ai-chat-panel className={panelClassName}>
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
              <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {panelTitle}
              </p>
              <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                {panelSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              title="清除对话"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              title="最小化"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-width:thin] [scrollbar-color:rgb(161_161_170)_transparent] dark:[scrollbar-color:rgb(82_82_91)_transparent]"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className={`mx-auto space-y-5 ${contentMaxWidthClass}`}>
            {articleContext && (
              <ArticleStarterCards
                entryContext={articleContext}
                dismissedQuestions={dismissedStarterQuestions}
                onSelectQuestion={onSelectStarterQuestion}
                disabled={isSending}
                animateIn={hasEntered}
              />
            )}

            {visibleMessages.map((message) =>
              message.role === "assistant" && getTextFromMessage(message).trim().length === 0 ? null :
              message.role === "assistant" ? (
                <div key={message.id} className="flex items-start gap-3">
                  <AuthorAvatar size={28} />
                  <div className="min-w-0 flex-1 pt-0.5 text-zinc-700 dark:text-zinc-300">
                    <MessageContent message={message} />
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[84%] rounded-2xl bg-zinc-100 px-4 py-2.5 text-[14px] leading-relaxed text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    <MessageContent message={message} />
                  </div>
                </div>
              ),
            )}

            {shouldShowTypingIndicator && <TypingIndicator statusMessage={latestStatusData?.message} />}

            {error && errorInfo && (
              <div className="flex items-start gap-3">
                <AuthorAvatar size={28} />
                <div className="pt-0.5">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {errorInfo.message}
                  </p>
                  {errorInfo.isRateLimit && (
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      为了保证服务质量，每位用户有一定的对话频率限制
                    </p>
                  )}
                  {errorInfo.detail && !errorInfo.isRateLimit && (
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      错误详情：{errorInfo.detail}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-zinc-100 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:pb-3 dark:border-zinc-800">
          <div className={`mx-auto flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 transition-colors focus-within:border-zinc-300 focus-within:bg-white dark:border-zinc-700 dark:bg-zinc-800/50 dark:focus-within:border-zinc-600 dark:focus-within:bg-zinc-800 ${contentMaxWidthClass}`}>
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              enterKeyHint="send"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={articleContext ? "继续追问这篇文章..." : "输入消息..."}
              maxLength={500}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[16px] text-zinc-800 outline-none placeholder:text-zinc-400 sm:text-sm dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || cooldown}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white transition-all hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            AI 回复基于公开内容生成，可能存在偏差
          </p>
        </div>
      </div>
    </>,
    document.body,
  );
}
