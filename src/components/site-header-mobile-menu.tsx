"use client";

import { useCallback, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { useClickOutside } from "@/hooks/use-click-outside";
import { IconGitHub, IconX } from "@/components/icons";
import { SiteHeaderAboutLink } from "./site-header-about-link";

export function SiteHeaderMobileMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(containerRef, close, open);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent text-zinc-600 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:border-transparent dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-700"
        aria-label="打开顶部菜单"
        title="菜单"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-40 w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span>{siteConfig.brand}</span>
          </a>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span>RSS</span>
          </a>
          <SiteHeaderAboutLink mobile />
          <a
            href={siteConfig.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span>X</span>
            <IconX className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span>GitHub</span>
            <IconGitHub className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
