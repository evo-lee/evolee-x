"use client";

import { useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/lib/analytics/summary";

const CLIENT_CACHE_KEY = "umami_analytics_cache";
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
const LOADING_INDICATOR_DELAY_MS = 300;

function readClientCache(): AnalyticsSummary | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CLIENT_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached) as {
      data: AnalyticsSummary;
      timestamp: number;
    };
    if (Date.now() - timestamp > CLIENT_CACHE_TTL_MS) return null;

    return data;
  } catch {
    return null;
  }
}

function writeClientCache(data: AnalyticsSummary) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore cache write failures in restricted environments.
  }
}

export function useAnalyticsSummary() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
      return;
    }

    const timerId = window.setTimeout(() => {
      setShowLoading(true);
    }, LOADING_INDICATOR_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [isLoading]);

  useEffect(() => {
    let isActive = true;
    const cached = readClientCache();
    if (cached) {
      setSummary(cached);
    }

    async function fetchAnalyticsSummary() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/analytics/summary");
        if (!response.ok) return;

        const data = (await response.json()) as AnalyticsSummary;
        if (!isActive) return;

        setSummary(data);
        writeClientCache(data);
      } catch (error) {
        console.error("Failed to fetch analytics summary:", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchAnalyticsSummary();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    showLoading,
    summary,
  };
}
