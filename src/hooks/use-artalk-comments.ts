"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { ensureScript, ensureStylesheet } from "@/lib/browser/dom-assets";
import {
  isDarkThemeActive,
  observeThemeClass,
} from "@/lib/browser/theme-observer";
import { siteConfig } from "@/lib/site-config";

const ARTALK_SCRIPT_ID = "artalk-js";
const ARTALK_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/artalk/dist/Artalk.js";
const ARTALK_STYLESHEET_ID = "artalk-css";
const ARTALK_STYLESHEET_SRC =
  "https://cdn.jsdelivr.net/npm/artalk/dist/Artalk.css";

interface ArtalkInstance {
  destroy: () => void;
  setDarkMode: (dark: boolean) => void;
}

declare global {
  interface Window {
    Artalk?: {
      init: (config: Record<string, unknown>) => ArtalkInstance;
    };
  }
}

interface UseArtalkCommentsOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  slug: string;
  title: string;
}

export function useArtalkComments({
  containerRef,
  enabled,
  slug,
  title,
}: UseArtalkCommentsOptions) {
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    let artalk: ArtalkInstance | null = null;
    let cancelled = false;
    let cleanupThemeObserver = () => {};

    const initializeComments = async () => {
      ensureStylesheet({
        href: ARTALK_STYLESHEET_SRC,
        id: ARTALK_STYLESHEET_ID,
      });

      await ensureScript({
        id: ARTALK_SCRIPT_ID,
        src: ARTALK_SCRIPT_SRC,
      });

      if (cancelled || !window.Artalk || !containerRef.current) {
        return;
      }

      artalk = window.Artalk.init({
        el: containerRef.current,
        pageKey: `${siteConfig.siteUrl}/${slug}/`,
        pageTitle: title,
        server: siteConfig.comments.server,
        site: siteConfig.comments.siteName,
        gravatar: {
          mirror: siteConfig.comments.gravatarMirror,
        },
      });

      artalk.setDarkMode(isDarkThemeActive());
      cleanupThemeObserver = observeThemeClass((isDark) => {
        artalk?.setDarkMode(isDark);
      });
    };

    void initializeComments().catch(() => {});

    return () => {
      cancelled = true;
      cleanupThemeObserver();
      artalk?.destroy();
    };
  }, [containerRef, enabled, slug, title]);
}
