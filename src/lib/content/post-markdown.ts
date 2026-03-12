import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { getFaviconUrlForDomain } from "@/lib/favicon";
import { siteConfig } from "@/lib/site-config";
import type { PostDetail } from "./types";
import {
  getArticleLazyImage,
  getImageDimensions,
  getOriginalImage,
} from "./utils";

const internalHostnames = (() => {
  try {
    const siteUrl = new URL(siteConfig.siteUrl);
    const host = siteUrl.hostname.toLowerCase();
    return host.startsWith("www.")
      ? new Set([host, host.slice(4)])
      : new Set([host, `www.${host}`]);
  } catch {
    return new Set<string>(["luolei.org", "www.luolei.org"]);
  }
})();

function parseTagAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /(\w+)=("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null = regex.exec(raw);

  while (match) {
    attrs[match[1]] = match[3] ?? match[4] ?? "";
    match = regex.exec(raw);
  }

  return attrs;
}

function renderTweetCardPlaceholder(attrs: Record<string, string>): string {
  const tweetId = attrs.tweetId ?? "";
  if (!tweetId) return "";

  return `<div data-tweet-id="${tweetId}" class="tweet-card-placeholder"></div>`;
}

function renderGearCard(attrs: Record<string, string>): string {
  const product = attrs.product ?? "";
  const image = attrs.image ?? attrs.cover ?? "";
  const prize = attrs.prize ?? "";
  const originalPrice = attrs.originalPrice ?? "";

  return `<div class="gear-card"><div class="gear-card-inner"><div class="gear-card-content"><div class="gear-card-image"><img src="${image}" alt="${product}" /></div><div class="gear-card-info"><h5 class="gear-card-title">${product}</h5><p class="gear-card-price">入手价格: ¥${prize}</p><p class="gear-card-original-price">原价: ¥${originalPrice}</p></div></div></div></div>`;
}

function transformCustomCards(content: string): string {
  const tweetPattern = /<TweetCard([\s\S]*?)\/>/g;
  const gearPattern = /<GearCard([\s\S]*?)\/>/g;

  const withTweets = content.replace(tweetPattern, (_match, attrsRaw: string) => {
    const attrs = parseTagAttributes(attrsRaw);
    return renderTweetCardPlaceholder(attrs);
  });

  return withTweets.replace(gearPattern, (_match, attrsRaw: string) => {
    const attrs = parseTagAttributes(attrsRaw);
    return renderGearCard(attrs);
  });
}

function getClassNames(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function imageTransformPlugin() {
  return function transformer(tree: Root) {
    visit(tree, "element", (node) => {
      const element = node as Element;
      if (element.tagName !== "img") return;

      const src = String(element.properties?.src ?? "");
      if (!src) return;

      const dimensions = getImageDimensions(src);
      const aspectRatio = dimensions
        ? `${dimensions.width} / ${dimensions.height}`
        : undefined;

      element.properties = {
        ...element.properties,
        "data-src": src,
        "data-original-src": src,
        "data-zoom-src": getOriginalImage(src),
        src: getArticleLazyImage(src),
        loading: "lazy",
        ...(dimensions && {
          width: dimensions.width,
          height: dimensions.height,
          "data-aspect-ratio": aspectRatio,
        }),
      };

      if (aspectRatio) {
        const existingStyle = String(element.properties.style ?? "");
        element.properties.style = existingStyle
          ? `${existingStyle}; aspect-ratio: ${aspectRatio};`.trim()
          : `aspect-ratio: ${aspectRatio};`;
      }
    });
  };
}

function linkFaviconPlugin() {
  return function transformer(tree: Root) {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;

      const element = node as Element;
      const href = String(element.properties?.href ?? "");
      if (!href || href.startsWith("#")) return;

      let domain: string;
      let isExternal = false;

      try {
        const url = new URL(href);
        if (url.protocol !== "http:" && url.protocol !== "https:") return;

        domain = url.hostname.toLowerCase();
        isExternal = !internalHostnames.has(domain);
      } catch {
        domain = new URL(siteConfig.siteUrl).hostname.toLowerCase();
      }

      const children = element.children || [];
      const hasFavicon = children.some((child) => {
        if (child.type !== "element") return false;

        const childEl = child as Element;
        const classNames = getClassNames(childEl.properties?.className);

        return childEl.tagName === "span" && classNames.includes("favicon-wrapper");
      });

      const faviconImg: Element = {
        type: "element",
        tagName: "img",
        properties: {
          className: ["favicon"],
          src: getFaviconUrlForDomain(domain),
          alt: "",
          loading: "lazy",
        },
        children: [],
      };

      const wrapper: Element = {
        type: "element",
        tagName: "span",
        properties: {
          className: ["favicon-wrapper"],
        },
        children: [faviconImg],
      };

      const classNames = new Set(getClassNames(element.properties?.className));
      classNames.add("has-favicon");

      if (isExternal) {
        const rel = new Set(getClassNames(element.properties?.rel));
        rel.add("noopener");
        rel.add("noreferrer");

        element.properties = {
          ...element.properties,
          className: Array.from(classNames),
          target: "_blank",
          rel: Array.from(rel).join(" "),
          "data-external-link": "true",
          "data-external-domain": domain,
        };
      } else {
        element.properties = {
          ...element.properties,
          className: Array.from(classNames),
          "data-internal-link": "true",
          "data-internal-domain": domain,
        };
      }

      if (!hasFavicon) {
        element.children = [wrapper, ...children];
      }
    });
  };
}

function extractHeadingsFromHtml(html: string): PostDetail["headings"] {
  const headings: PostDetail["headings"] = [];
  const headingPattern =
    /<h([23])\s+[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h\1>/g;
  let match: RegExpExecArray | null = headingPattern.exec(html);

  while (match) {
    const rawText = match[3]
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    if (rawText) {
      headings.push({
        id: match[2],
        text: rawText,
        level: Number(match[1]),
      });
    }

    match = headingPattern.exec(html);
  }

  return headings;
}

export async function renderPostHtml(content: string): Promise<{
  html: string;
  headings: PostDetail["headings"];
}> {
  const transformedContent = transformCustomCards(content);
  const rendered = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["article-anchor"],
      },
    })
    .use(imageTransformPlugin)
    .use(linkFaviconPlugin)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(transformedContent);

  const html = String(rendered);

  return {
    html,
    headings: extractHeadingsFromHtml(html),
  };
}
