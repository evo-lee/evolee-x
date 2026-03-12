"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const ABOUT_VISITED_STORAGE_KEY = "about_visited";
const ABOUT_PULSE_DURATION_MS = 8000;

interface SiteHeaderAboutLinkProps {
  mobile?: boolean;
}

export function SiteHeaderAboutLink({
  mobile = false,
}: SiteHeaderAboutLinkProps) {
  const pathname = usePathname();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (pathname === "/about") {
      window.localStorage.setItem(ABOUT_VISITED_STORAGE_KEY, "1");
      const timerId = window.setTimeout(() => setPulse(false), 0);
      return () => window.clearTimeout(timerId);
    }

    if (window.localStorage.getItem(ABOUT_VISITED_STORAGE_KEY)) {
      return;
    }

    const timerId = window.setTimeout(() => setPulse(true), 0);
    return () => window.clearTimeout(timerId);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!pulse || window.localStorage.getItem(ABOUT_VISITED_STORAGE_KEY)) {
      return;
    }

    const timerId = window.setTimeout(() => setPulse(false), ABOUT_PULSE_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [pulse]);

  if (mobile) {
    return (
      <Link
        href="/about"
        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles
            className={`h-3 w-3 text-violet-500 dark:text-violet-400${pulse ? " animate-[about-sparkle_1.5s_ease-in-out_4]" : ""}`}
          />
          关于
        </span>
        <span className="text-[10px] font-medium tracking-wider text-violet-500/60 dark:text-violet-400/60">
          AI
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/about"
      className={`group relative inline-flex items-center gap-1 rounded-full border border-violet-200/50 bg-linear-to-r from-violet-50/80 to-indigo-50/80 px-2.5 py-0.5 text-sm text-zinc-600 transition-all duration-300 hover:border-violet-300/60 hover:from-violet-100 hover:to-indigo-100 hover:text-violet-700 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] dark:border-violet-500/20 dark:from-violet-500/10 dark:to-indigo-500/10 dark:text-zinc-300 dark:hover:border-violet-400/40 dark:hover:from-violet-500/20 dark:hover:to-indigo-500/20 dark:hover:text-violet-300 dark:hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]${pulse ? " animate-[about-glow_2s_ease-in-out_3]" : ""}`}
    >
      <Sparkles
        className={`h-3 w-3 text-violet-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 dark:text-violet-400${pulse ? " animate-[about-sparkle_1.5s_ease-in-out_4]" : ""}`}
      />
      <span>关于</span>
    </Link>
  );
}
