"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { IconGitHub, IconX } from "@/components/icons";
import { AuthorAvatar } from "@/components/chat/chat-avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrollThreshold } from "@/hooks/use-scroll-threshold";
import { useAIChat } from "./ai-chat-provider";
import { SearchCommand } from "./search-command";
import { SiteHeaderAboutLink } from "./site-header-about-link";
import { SiteHeaderMobileMenu } from "./site-header-mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const { toggle: toggleAIChat } = useAIChat();
  const isArticlePage =
    pathname !== "/" &&
    !pathname.startsWith("/page/") &&
    !pathname.startsWith("/category/");
  const isMobileViewport = useMediaQuery("(max-width: 767px)");
  const scrolled = useScrollThreshold(10);
  const passedMobileHideThreshold = useScrollThreshold(20);
  const mobileHidden = isArticlePage && isMobileViewport && passedMobileHideThreshold;

  const baseClasses = "fixed left-0 right-0 top-0 z-50 bg-[color:var(--vp-c-bg)]/95 backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 ease-out dark:bg-[color:var(--vp-c-bg)]/90";
  const articleClasses = "border-b border-zinc-200/80 shadow-sm dark:border-zinc-800/80";
  const homeClasses = "border-b border-transparent";
  const hiddenClasses =
    mobileHidden
      ? "-translate-y-full pointer-events-none md:pointer-events-auto"
      : "translate-y-0";

  return (
    <header
      data-scrolled={scrolled}
      data-mobile-hidden={mobileHidden}
      className={`${baseClasses} ${isArticlePage ? articleClasses : homeClasses} ${hiddenClasses}`}
    >
      <div className="mx-auto flex h-[60px] w-full max-w-[1280px] items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="home-nav-title flex items-center gap-2.5 whitespace-nowrap text-base font-semibold tracking-wide"
        >
          <Image
            src="/legacy/logo.png"
            alt={`${siteConfig.author.name} logo`}
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span>{siteConfig.title}</span>
        </Link>
        <nav className="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
          <div className="hidden items-center md:flex">
            <div className="flex items-center gap-2.5">
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-1 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                ZUOLUOTV
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-1 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                RSS
              </a>
              <SiteHeaderAboutLink />
            </div>

            <span className="mx-3 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                title="X"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <IconX className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <IconGitHub className="h-5 w-5" />
              </a>
            </div>

            <div className="ml-3 flex items-center gap-1">
              <button
                type="button"
                onClick={toggleAIChat}
                className="group relative inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="AI 对话"
                title="AI 对话（Enter）"
              >
                <AuthorAvatar size={22} />
              </button>
              <SearchCommand />
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={toggleAIChat}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="AI 对话"
              title="AI 对话"
            >
              <AuthorAvatar size={20} />
            </button>
            <SearchCommand />
            <ThemeToggle />

            <SiteHeaderMobileMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
