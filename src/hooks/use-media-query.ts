"use client";

import { useSyncExternalStore } from "react";

function getMatch(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

function subscribe(query: string, onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(query);
  const handleChange = () => onStoreChange();
  mediaQuery.addEventListener("change", handleChange);

  return () => mediaQuery.removeEventListener("change", handleChange);
}

export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getMatch(query),
    () => fallback,
  );
}
