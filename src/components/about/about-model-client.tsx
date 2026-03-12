"use client";

import type { ReactNode } from "react";
import type { ModelEntry } from "@/lib/content/author-profile";
import { useAboutModelSelection } from "@/hooks/use-about-model-selection";
import { ModelSwitcher } from "./model-switcher";

interface AboutModelClientProps {
  defaultModelId: string;
  models: ModelEntry[];
  children: (activeModelId: string) => ReactNode;
}

export function AboutModelClient({
  defaultModelId,
  models,
  children,
}: AboutModelClientProps) {
  const { activeModelId, handleModelChange } = useAboutModelSelection({
    defaultModelId,
    models,
  });

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
