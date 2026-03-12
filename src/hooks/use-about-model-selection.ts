"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ModelEntry } from "@/lib/content/author-profile";

interface UseAboutModelSelectionOptions {
  defaultModelId: string;
  models: ModelEntry[];
}

function readModelIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("model");
}

function replaceModelIdInUrl(modelId: string, fallbackModelId: string) {
  const url = new URL(window.location.href);

  if (modelId === fallbackModelId) {
    url.searchParams.delete("model");
  } else {
    url.searchParams.set("model", modelId);
  }

  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function resolveModelId(
  candidateModelId: string | null | undefined,
  availableModelIds: Set<string>,
  fallbackModelId: string,
): string {
  if (candidateModelId && availableModelIds.has(candidateModelId)) {
    return candidateModelId;
  }

  return fallbackModelId;
}

export function useAboutModelSelection({
  defaultModelId,
  models,
}: UseAboutModelSelectionOptions) {
  const modelIds = useMemo(
    () => models.map((model) => model.id).filter(Boolean),
    [models],
  );
  const availableModelIds = useMemo(() => new Set(modelIds), [modelIds]);
  const fallbackModelId = useMemo(() => {
    if (defaultModelId && availableModelIds.has(defaultModelId)) {
      return defaultModelId;
    }

    return modelIds[0] ?? "";
  }, [availableModelIds, defaultModelId, modelIds]);

  const [activeModelId, setActiveModelId] = useState(fallbackModelId);

  useEffect(() => {
    const syncFromUrl = () => {
      const nextModelId = resolveModelId(
        readModelIdFromUrl(),
        availableModelIds,
        fallbackModelId,
      );

      setActiveModelId((currentModelId) =>
        currentModelId === nextModelId ? currentModelId : nextModelId,
      );
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, [availableModelIds, fallbackModelId]);

  const handleModelChange = useCallback(
    (modelId: string) => {
      const nextModelId = resolveModelId(
        modelId,
        availableModelIds,
        fallbackModelId,
      );

      setActiveModelId(nextModelId);
      replaceModelIdInUrl(nextModelId, fallbackModelId);
    },
    [availableModelIds, fallbackModelId],
  );

  return {
    activeModelId,
    handleModelChange,
  };
}
