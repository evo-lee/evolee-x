"use client";

import type { ChatEntryContext } from "@/lib/ai/chat-context";

interface ArticleStarterCardsProps {
  entryContext: Extract<ChatEntryContext, { scope: "article" }>;
  dismissedQuestions: string[];
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
  animateIn: boolean;
}

export function ArticleStarterCards({
  entryContext,
  dismissedQuestions,
  onSelectQuestion,
  disabled = false,
  animateIn,
}: ArticleStarterCardsProps) {
  const article = entryContext.article;
  const questions = (article.focusQuestions?.slice(0, 3) ?? []).filter(
    (question) => !dismissedQuestions.includes(question),
  );

  if (questions.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:border-zinc-800 dark:bg-zinc-800/50 ${
        animateIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {article.title}
      </p>
      {article.summary && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          {article.summary}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelectQuestion(question)}
            disabled={disabled}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-left text-[12px] leading-relaxed text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
