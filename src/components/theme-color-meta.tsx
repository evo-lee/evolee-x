"use client";

import { useEffect } from "react";

const LIGHT_COLOR = "#ffffff";
const DARK_COLOR = "#1e1e20";

export function ThemeColorMeta() {
  useEffect(() => {
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const color = isDark ? DARK_COLOR : LIGHT_COLOR;

      // Remove any media-query theme-color metas (from SSR/framework)
      document
        .querySelectorAll('meta[name="theme-color"][media]')
        .forEach((el) => el.remove());

      // Ensure a single theme-color meta exists and update it
      let meta = document.querySelector(
        'meta[name="theme-color"]:not([media])',
      ) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", color);
    };

    updateThemeColor();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          updateThemeColor();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
