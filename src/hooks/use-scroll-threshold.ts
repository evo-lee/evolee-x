"use client";

import { useSyncExternalStore } from "react";

export function useScrollThreshold(
  threshold: number,
  options?: { disabled?: boolean },
): boolean {
  const disabled = options?.disabled ?? false;

  return useSyncExternalStore(
    (onStoreChange) => {
      if (disabled || typeof window === "undefined") {
        return () => {};
      }

      window.addEventListener("scroll", onStoreChange, { passive: true });
      return () => window.removeEventListener("scroll", onStoreChange);
    },
    () => !disabled && typeof window !== "undefined" && window.scrollY > threshold,
    () => false,
  );
}
