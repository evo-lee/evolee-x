"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchItem {
  id: string;
  title: string;
  url: string;
  cover?: string;
  excerpt: string;
  content: string;
  score: number;
  keyPoints?: string[];
}

interface SearchResponse {
  results: SearchItem[];
}

interface PagefindData {
  url: string;
  excerpt?: string;
  content?: string;
  meta?: {
    title?: string;
    cover?: string;
  };
}

interface PagefindResult {
  id: string;
  score: number;
  data: () => Promise<PagefindData>;
}

interface PagefindSearchResponse {
  results: PagefindResult[];
}

interface PagefindApi {
  search: (
    query: string,
    options?: { limit?: number },
  ) => Promise<PagefindSearchResponse>;
  options?: (options: { bundlePath?: string; baseUrl?: string }) => void;
}

function getCacheKey(rawQuery: string, relatedSlug: string): string {
  const normalized = rawQuery.trim().toLowerCase();
  return !normalized && relatedSlug ? `related:${relatedSlug}` : normalized;
}

const SKELETON_ROWS = 5;

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(url: string): string {
  if (!url) return "/";

  let value = url;
  try {
    value = new URL(url, "http://localhost").pathname;
  } catch {
    value = url;
  }

  value = value.replace(/^\/pagefind(?=\/|$)/, "") || "/";
  value = value.replace(/\/index\.html$/, "") || "/";

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  const clean =
    value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
  return clean === "/home" ? "/" : clean;
}

async function loadPagefind(): Promise<PagefindApi | null> {
  try {
    // Use new Function to create a native dynamic import that bypasses
    // Vite's module transform — pagefind.js lives in /public and must
    // not go through the Vite pipeline.
    const nativeImport = new Function("u", "return import(u)") as (
      url: string,
    ) => Promise<unknown>;
    const mod = (await nativeImport(
      "/pagefind/pagefind.js",
    )) as Partial<PagefindApi>;
    if (typeof mod.search !== "function") return null;
    if (typeof mod.options === "function") {
      mod.options({ bundlePath: "/pagefind/", baseUrl: "/" });
    }
    return mod as PagefindApi;
  } catch {
    return null;
  }
}

async function fetchFromApi(
  query: string,
  signal: AbortSignal,
  relatedSlug?: string,
): Promise<SearchItem[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (!query && relatedSlug) params.set("related", relatedSlug);
  params.set("limit", "24");

  const res = await fetch(`/api/search/docs?${params.toString()}`, {
    signal,
    cache: "no-store",
  });
  const data = (await res.json()) as SearchResponse;
  return Array.isArray(data.results) ? data.results : [];
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const cacheRef = useRef(new Map<string, SearchItem[]>());
  const pagefindRef = useRef<PagefindApi | null>(null);
  const requestIdRef = useRef(0);

  // 检测当前是否在文章详情页（排除首页和 category 等路径）
  const currentSlug =
    pathname !== "/" && !pathname.startsWith("/category") && !pathname.startsWith("/page")
      ? pathname.replace(/^\//, "")
      : "";

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);

      if (!nextOpen) {
        setLoading(false);
        return;
      }

      setQuery("");
      const cacheKey = getCacheKey("", currentSlug);
      const cached = cacheRef.current.get(cacheKey);
      setResults(cached ?? []);
      setLoading(!cached);
    },
    [currentSlug],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const cacheKey = getCacheKey(value, currentSlug);
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleOpenChange(!open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleOpenChange]);

  useEffect(() => {
    if (!open) return;

    const normalized = query.trim().toLowerCase();
    const controller = new AbortController();
    // 缓存 key 区分相关推荐和普通搜索
    const cacheKey = getCacheKey(query, currentSlug);
    const requestId = ++requestIdRef.current;
    const shouldDelay = normalized ? 120 : 0;

    const timer = setTimeout(() => {
      const run = async () => {
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          if (requestId !== requestIdRef.current) return;
          setResults(cached);
          setLoading(false);
          return;
        }

        if (requestId === requestIdRef.current) {
          setLoading(true);
        }

        try {
          if (!normalized) {
            const latest = await fetchFromApi("", controller.signal, currentSlug || undefined);
            if (requestId !== requestIdRef.current) return;
            cacheRef.current.set(cacheKey, latest);
            setResults(latest);
            return;
          }

          if (!pagefindRef.current) {
            pagefindRef.current = await loadPagefind();
          }

          if (pagefindRef.current) {
            const found = await pagefindRef.current.search(normalized, {
              limit: 24,
            });

            const mapped = await Promise.all(
              found.results.map(async (entry) => {
                const data = await entry.data();
                const excerpt = stripHtml(data.excerpt ?? "");
                const content = stripHtml(data.content ?? "");

                return {
                  id: entry.id,
                  title: data.meta?.title?.trim() || normalizeUrl(data.url),
                  url: normalizeUrl(data.url),
                  cover: data.meta?.cover?.trim() || "",
                  excerpt,
                  content,
                  score: entry.score,
                } satisfies SearchItem;
              }),
            );

            if (requestId !== requestIdRef.current) return;
            cacheRef.current.set(cacheKey, mapped);
            setResults(mapped);
            return;
          }

          const fallback = await fetchFromApi(normalized, controller.signal);
          if (requestId !== requestIdRef.current) return;
          cacheRef.current.set(cacheKey, fallback);
          setResults(fallback);
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") return;
          const fallback = await fetchFromApi(
            normalized,
            controller.signal,
          ).catch(() => []);
          if (requestId !== requestIdRef.current) return;
          cacheRef.current.set(cacheKey, fallback);
          setResults(fallback);
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        }
      };

      void run();
    }, shouldDelay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, currentSlug]);

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="inline-flex h-8 w-8 items-center justify-center gap-2 rounded-md border border-transparent bg-transparent text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-transparent dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-auto sm:justify-start sm:border-zinc-200 sm:bg-transparent sm:px-2 sm:py-1 sm:dark:border-zinc-700"
        aria-label="Open search"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">搜索</span>
        <span className="hidden rounded border border-zinc-300 px-1 text-[10px] text-zinc-400 lg:inline dark:border-zinc-600">
          ⌘K
        </span>
      </button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={handleQueryChange}
            placeholder={currentSlug ? "搜索更多文章..." : "搜索文章标题或正文内容..."}
          />
          <CommandList>
            {loading ? (
              <CommandGroup
                heading={!query.trim() && currentSlug ? "相关推荐" : "文章"}
              >
                {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    aria-hidden="true"
                    className="flex items-center gap-2 rounded-md px-2 py-2"
                  >
                    <div className="h-12 w-16 shrink-0 rounded bg-zinc-200/80 animate-pulse dark:bg-zinc-700/80" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="h-3 w-4/5 rounded bg-zinc-200/85 animate-pulse dark:bg-zinc-700/85" />
                      <div className="h-3 w-full rounded bg-zinc-200/60 animate-pulse dark:bg-zinc-700/60" />
                    </div>
                  </div>
                ))}
              </CommandGroup>
            ) : null}

            {!loading ? (
              <>
                <CommandEmpty>没有找到相关内容</CommandEmpty>
                <CommandGroup heading={!query.trim() && currentSlug ? "相关推荐" : "文章"}>
                  {results.map((item) => (
                    <CommandItem
                      key={`${item.id}-${item.url}`}
                      value={`${item.title} ${item.excerpt} ${item.content}`}
                      onSelect={() => {
                        handleOpenChange(false);
                        setQuery("");
                        router.push(item.url);
                      }}
                    >
                      <div className="relative flex h-12 w-16 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                        <FileText className="h-4 w-4 text-zinc-400" />
                        {item.cover && (
                          <Image
                            src={item.cover}
                            alt=""
                            width={64}
                            height={48}
                            className="absolute inset-0 h-full w-full rounded object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm text-zinc-800 dark:text-zinc-100">
                          {item.title}
                        </span>
                        {item.keyPoints && item.keyPoints.length > 0 ? (
                          <span className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {item.keyPoints.slice(0, 2).join(" · ")}
                          </span>
                        ) : (
                          <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {item.excerpt || item.content.slice(0, 80)}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
