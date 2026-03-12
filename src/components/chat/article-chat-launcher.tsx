"use client";

import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { useEntranceTransition } from "@/hooks/use-entrance-transition";
import { AuthorAvatar } from "./chat-avatar";

interface ArticleChatLauncherProps {
  articleTitle: string;
  openingLine?: string;
  onOpen: () => void;
  compact?: boolean;
}

export function ArticleChatLauncher({
  articleTitle,
  openingLine,
  onOpen,
  compact = false,
}: ArticleChatLauncherProps) {
  const entered = useEntranceTransition();

  if (typeof document === "undefined") {
    return null;
  }

  if (compact) {
    return createPortal(
      <div
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-99 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.92] opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-label={`和《${articleTitle}》边读边聊`}
          className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/74 text-zinc-700 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.5),0_8px_18px_-14px_rgba(15,23,42,0.28)] ring-1 ring-black/6 backdrop-blur-xl transition-[transform,box-shadow,background-color] duration-220 ease-out hover:-translate-y-0.5 hover:bg-white/86 hover:shadow-[0_14px_30px_-16px_rgba(15,23,42,0.55),0_10px_20px_-16px_rgba(15,23,42,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 motion-reduce:transition-none dark:bg-zinc-900/76 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-zinc-900/88"
        >
          <AuthorAvatar size={33} badgeTone="neutral" compactBadge />
        </button>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      className={`fixed bottom-4 left-3 right-3 z-99 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:left-auto sm:right-4 sm:w-[320px] ${
        entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-start gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-3.5 py-3 text-left shadow-xl backdrop-blur transition-[box-shadow,border-color] duration-220 ease-out hover:border-zinc-300 hover:shadow-2xl motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-900/95 dark:hover:border-zinc-600"
      >
        <AuthorAvatar size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            边读边聊
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {articleTitle}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            {openingLine || "我可以结合这篇文章继续展开讲。"}
          </p>
        </div>
        <Sparkles className="mt-1 h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-violet-400 dark:text-zinc-600 dark:group-hover:text-violet-400" />
      </button>
    </div>,
    document.body,
  );
}
