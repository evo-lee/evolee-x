"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_STORAGE_KEY = "theme";
const THEME_MANUAL_KEY = "theme_manual_override";
const THEME_CHANGE_EVENT = "luolei-theme-change";

type ThemeMode = "dark" | "light";

function readStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return null;
}

function isManualOverrideEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(THEME_MANUAL_KEY) === "1";
}

function readSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readThemeFromDom(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: ThemeMode, persist: boolean) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  if (persist) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(THEME_MANUAL_KEY, "1");
  }
}

function emitThemeChange() {
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT));
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => readThemeFromDom() === "dark");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncThemeByMode = () => {
      const nextTheme = isManualOverrideEnabled()
        ? (readStoredTheme() ?? readSystemTheme())
        : readSystemTheme();
      applyTheme(nextTheme, false);
      setIsDark(nextTheme === "dark");
    };

    const syncFromDom = () => {
      setIsDark(readThemeFromDom() === "dark");
    };

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-follow system if user hasn't manually chosen
      if (!isManualOverrideEnabled()) {
        applyTheme(e.matches ? "dark" : "light", false);
        emitThemeChange();
      }
    };

    const handleThemeChange = () => {
      syncFromDom();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncThemeByMode();
        emitThemeChange();
      }
    };

    syncThemeByMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener("pageshow", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("pageshow", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const toggleTheme = () => {
    const currentTheme = readThemeFromDom();
    const nextTheme: ThemeMode = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
    setIsDark(nextTheme === "dark");
    emitThemeChange();
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-transparent text-zinc-600 transition-all hover:scale-105 hover:bg-zinc-100 dark:border-transparent dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <Sun
        className={`h-4 w-4 transition-all duration-200 ${
          isDark
            ? "scale-0 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-200 ${
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-90 opacity-0"
        }`}
      />
    </button>
  );
}
