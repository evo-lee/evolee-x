"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/use-theme-mode";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode();

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
