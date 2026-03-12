"use client";

import { useEffect, useState } from "react";
import {
  THEME_CHANGE_EVENT,
  applyTheme,
  emitThemeChange,
  isManualThemeOverrideEnabled,
  readThemeFromDom,
  resolvePreferredTheme,
  toggleThemePreference,
  type ThemeMode,
} from "@/lib/theme";

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>(() => readThemeFromDom());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncFromPreference = () => {
      const nextTheme = resolvePreferredTheme();
      applyTheme(nextTheme, false);
      setTheme(nextTheme);
    };

    const syncFromDom = () => {
      setTheme(readThemeFromDom());
    };

    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      if (!isManualThemeOverrideEnabled()) {
        applyTheme(event.matches ? "dark" : "light", false);
        emitThemeChange();
      }
    };

    const handleThemeChange = () => {
      syncFromDom();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncFromPreference();
        emitThemeChange();
      }
    };

    syncFromPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaQueryChange);
    } else {
      mediaQuery.addListener(handleMediaQueryChange);
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener("pageshow", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
      } else {
        mediaQuery.removeListener(handleMediaQueryChange);
      }

      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("pageshow", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(toggleThemePreference());
  };

  return {
    isDark: theme === "dark",
    toggleTheme,
  };
}
