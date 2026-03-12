"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export interface SearchItem {
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
    // pagefind.js lives under /public, so this import must bypass the Vite transform pipeline.
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

function getCurrentSlug(pathname: string): string {
  return pathname !== "/" &&
    !pathname.startsWith("/category") &&
    !pathname.startsWith("/page")
    ? pathname.replace(/^\//, "")
    : "";
}

export function useSearchCommandState() {
  const pathname = usePathname();
  const currentSlug = getCurrentSlug(pathname);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(new Map<string, SearchItem[]>());
  const pagefindRef = useRef<PagefindApi | null>(null);
  const requestIdRef = useRef(0);

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

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    const cacheKey = getCacheKey(value, currentSlug);
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
    }
  }, [currentSlug]);

  const resetQuery = useCallback(() => {
    setQuery("");
  }, []);

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
  }, [currentSlug, open, query]);

  return {
    open,
    query,
    results,
    loading,
    currentSlug,
    handleOpenChange,
    handleQueryChange,
    resetQuery,
  };
}
