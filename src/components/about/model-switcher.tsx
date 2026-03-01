"use client";

import { useState, useCallback } from "react";
import type { ModelEntry } from "@/lib/content/author-profile";

interface ModelSwitcherProps {
  models: ModelEntry[];
  activeModelId: string;
  onModelChange: (modelId: string) => void;
}

const MODEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  openai: {
    bg: "bg-zinc-100 dark:bg-zinc-800/40",
    border: "border-zinc-300 dark:border-zinc-700",
    text: "text-zinc-800 dark:text-zinc-200",
  },
  gemini: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
  },
  qwen: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
  },
  kimi: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  doubao: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
  },
  zhipu: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
  },
};

function getModelColors(icon: string) {
  return MODEL_COLORS[icon] ?? {
    bg: "bg-zinc-50 dark:bg-zinc-900/30",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-700 dark:text-zinc-300",
  };
}

function getFaviconUrl(providerSite: string): string | null {
  if (!providerSite) return null;
  try {
    const domain = new URL(providerSite).hostname;
    return `https://img.is26.com/static.is26.com/favicon/${domain}`;
  } catch {
    return null;
  }
}

export function ModelSwitcher({
  models,
  activeModelId,
  onModelChange,
}: ModelSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-1 dark:border-zinc-800/80 dark:bg-zinc-900/40">
      {models.map((model) => {
        const isActive = model.id === activeModelId;
        const colors = getModelColors(model.icon);
        const faviconUrl = getFaviconUrl(model.providerSite);

        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onModelChange(model.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? `${colors.bg} ${colors.border} ${colors.text} border shadow-sm`
                : "border border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60"
            }`}
            aria-pressed={isActive}
          >
            <ProviderFavicon url={faviconUrl} name={model.name} />
            <span>{model.name}</span>
            {model.generatedBy === "ai" && (
              <span className="ml-0.5 text-[10px] opacity-60">AI</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Provider Favicon (uses the same API as article external links) ───

function ProviderFavicon({ url, name }: { url: string | null; name: string }) {
  if (!url) {
    return <FallbackIcon />;
  }

  return (
    <img
      src={url}
      alt={name}
      width={16}
      height={16}
      loading="lazy"
      className="h-4 w-4 shrink-0 rounded-sm object-contain"
      onError={(e) => {
        // Hide broken image, show nothing rather than a broken icon
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function FallbackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

// ─── About Client Wrapper ────────────────────────────────────
// This wraps all about sections and manages model switching state

interface AboutClientProps {
  defaultModelId: string;
  models: ModelEntry[];
  children: (activeModelId: string) => React.ReactNode;
}

export function AboutClient({ defaultModelId, models, children }: AboutClientProps) {
  const [activeModelId, setActiveModelId] = useState(defaultModelId);

  const handleModelChange = useCallback((modelId: string) => {
    setActiveModelId(modelId);
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (modelId === defaultModelId) {
      url.searchParams.delete("model");
    } else {
      url.searchParams.set("model", modelId);
    }
    window.history.replaceState(null, "", url.toString());
  }, [defaultModelId]);

  return (
    <>
      <div className="mt-5">
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-500">
          切换 AI 模型视角
        </p>
        <ModelSwitcher
          models={models}
          activeModelId={activeModelId}
          onModelChange={handleModelChange}
        />
      </div>
      {children(activeModelId)}
    </>
  );
}
