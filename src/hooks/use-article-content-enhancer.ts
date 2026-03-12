"use client";

import { createElement, useEffect } from "react";
import mediumZoom from "medium-zoom";
import { createRoot, type Root } from "react-dom/client";
import { TweetCard } from "@/components/tweet-card";
import {
  ensureExternalLinkAttributes,
  getExternalLinkUrl,
} from "@/lib/browser/external-links";

interface UmamiTrackPayload {
  article_path: string;
  article_slug: string;
  link_text: string;
  target_domain: string;
  target_url: string;
}

interface UmamiApi {
  track: (eventName: string, eventData?: UmamiTrackPayload) => void;
}

declare global {
  interface Window {
    umami?: UmamiApi;
  }
}

const ARTICLE_BODY_SELECTOR = ".article-body";
const ARTICLE_IMAGE_SELECTOR = "img:not(.favicon)";
const ARTICLE_LINK_SELECTOR = "a[href]";
const ARTICLE_FAVICON_LINK_SELECTOR = "a.has-favicon";
const TWEET_PLACEHOLDER_SELECTOR = ".tweet-card-placeholder";

function getArticleInfo() {
  const articlePath = window.location.pathname || "/";
  const articleSlug = articlePath.replace(/^\/+|\/+$/g, "") || "index";
  return { articlePath, articleSlug };
}

function getLinkText(link: HTMLAnchorElement): string {
  const linkText = (link.textContent ?? "").replace(/\s+/g, " ").trim();
  return linkText.slice(0, 120) || "(empty)";
}

function markLoadedImage(image: HTMLImageElement, state: "error" | "true") {
  image.setAttribute("data-loaded", state);
}

function bindArticleImageState(articleBody: HTMLElement): Array<() => void> {
  const cleanups: Array<() => void> = [];
  const articleImages =
    articleBody.querySelectorAll<HTMLImageElement>(ARTICLE_IMAGE_SELECTOR);

  articleImages.forEach((image) => {
    if (image.complete) {
      markLoadedImage(image, image.naturalHeight > 0 ? "true" : "error");
      return;
    }

    const handleLoad = () => markLoadedImage(image, "true");
    const handleError = () => markLoadedImage(image, "error");

    image.addEventListener("load", handleLoad, { once: true });
    image.addEventListener("error", handleError, { once: true });

    cleanups.push(() => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    });
  });

  return cleanups;
}

function markBrokenFavicon(link: HTMLAnchorElement) {
  link.classList.remove("has-favicon");
  link.classList.add("err-favicon");
}

function bindFaviconFallbacks(articleBody: HTMLElement): Array<() => void> {
  const cleanups: Array<() => void> = [];
  const links = articleBody.querySelectorAll<HTMLAnchorElement>(
    ARTICLE_FAVICON_LINK_SELECTOR,
  );

  links.forEach((link) => {
    const image = link.querySelector<HTMLImageElement>("img.favicon");
    if (!image) {
      return;
    }

    if (image.complete && image.naturalHeight === 0) {
      markBrokenFavicon(link);
      return;
    }

    const handleError = () => markBrokenFavicon(link);
    image.addEventListener("error", handleError, { once: true });
    cleanups.push(() => image.removeEventListener("error", handleError));
  });

  return cleanups;
}

function hydrateTweetCards(articleBody: HTMLElement): () => void {
  const mountedRoots: Array<{ placeholder: HTMLElement; root: Root }> = [];
  const placeholders =
    articleBody.querySelectorAll<HTMLElement>(TWEET_PLACEHOLDER_SELECTOR);

  placeholders.forEach((placeholder) => {
    const tweetId = placeholder.getAttribute("data-tweet-id");
    if (!tweetId || placeholder.hasAttribute("data-hydrated")) {
      return;
    }

    const root = createRoot(placeholder);
    root.render(createElement(TweetCard, { tweetId }));
    placeholder.setAttribute("data-hydrated", "true");
    mountedRoots.push({ placeholder, root });
  });

  return () => {
    for (const { placeholder, root } of mountedRoots) {
      root.unmount();
      placeholder.removeAttribute("data-hydrated");
    }
  };
}

export function useArticleContentEnhancer() {
  useEffect(() => {
    const articleBody = document.querySelector<HTMLElement>(ARTICLE_BODY_SELECTOR);
    if (!articleBody) {
      return;
    }

    const cleanupImageState = bindArticleImageState(articleBody);
    const cleanupFaviconFallbacks = bindFaviconFallbacks(articleBody);

    const articleImages = Array.from(
      articleBody.querySelectorAll<HTMLImageElement>(ARTICLE_IMAGE_SELECTOR),
    );
    const zoom = mediumZoom(articleImages, {
      background: "var(--vp-c-bg)",
      margin: 24,
    });

    const allLinks =
      articleBody.querySelectorAll<HTMLAnchorElement>(ARTICLE_LINK_SELECTOR);

    allLinks.forEach((link) => {
      const externalUrl = getExternalLinkUrl(link);
      if (externalUrl) {
        ensureExternalLinkAttributes(link, externalUrl);
      }
    });

    const handleOutboundClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) {
        return;
      }

      const link = target.closest<HTMLAnchorElement>(ARTICLE_LINK_SELECTOR);
      if (!link) {
        return;
      }

      const externalUrl = getExternalLinkUrl(link);
      if (!externalUrl) {
        return;
      }

      ensureExternalLinkAttributes(link, externalUrl);

      const { articlePath, articleSlug } = getArticleInfo();
      window.umami?.track?.("article_outbound_click", {
        article_path: articlePath,
        article_slug: articleSlug,
        link_text: getLinkText(link),
        target_domain: externalUrl.hostname.toLowerCase(),
        target_url: externalUrl.href,
      });
    };

    articleBody.addEventListener("click", handleOutboundClick, true);
    const cleanupTweetCards = hydrateTweetCards(articleBody);

    return () => {
      zoom.detach();
      articleBody.removeEventListener("click", handleOutboundClick, true);
      cleanupTweetCards();
      cleanupImageState.forEach((cleanup) => cleanup());
      cleanupFaviconFallbacks.forEach((cleanup) => cleanup());
    };
  }, []);
}
