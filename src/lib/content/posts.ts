import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";
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
import type { SearchDocument } from "@luoleiorg/search-core";
import { siteConfig } from "@/lib/site-config";
import type { PostDetail, PostFrontmatter, PostItem } from "./types";
import { getAISummary } from "./ai-data";
import {
  formatDate,
  formatShowDate,
  getArticleLazyImage,
  getPreviewImage,
  getOriginalImage,
  getImageDimensions,
} from "./utils";

// Use Vite's import.meta.glob to load markdown files at build time
const markdownFiles = import.meta.glob("/content/posts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

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

function extractExcerpt(content: string): string {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !line.startsWith("!["));

  return lines[0]?.slice(0, 180) ?? "";
}

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

// 新的占位符渲染函数
function renderTweetCardPlaceholder(attrs: Record<string, string>): string {
  const tweetId = attrs.tweetId ?? "";
  if (!tweetId) return "";

  // 返回占位符，客户端组件会替换为真实内容
  return `<div data-tweet-id="${tweetId}" class="tweet-card-placeholder"></div>`;
}

// 保留 GearCard 的原始渲染
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

  const withTweets = content.replace(
    tweetPattern,
    (_match, attrsRaw: string) => {
      const attrs = parseTagAttributes(attrsRaw);
      return renderTweetCardPlaceholder(attrs);
    },
  );

  return withTweets.replace(gearPattern, (_match, attrsRaw: string) => {
    const attrs = parseTagAttributes(attrsRaw);
    return renderGearCard(attrs);
  });
}

// 获取外部网站 favicon
function getFaviconUrl(domain: string): string {
  return `https://img.is26.com/static.is26.com/favicon/${domain}`;
}

function getClassNames(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getExternalUrl(href: string): URL | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    if (internalHostnames.has(url.hostname.toLowerCase())) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function imageTransformPlugin() {
  return function transformer(tree: Root) {
    visit(tree, "element", (node) => {
      const element = node as Element;
      if (element.tagName !== "img") return;
      const src = String(element.properties?.src ?? "");
      if (!src) return;

      // 获取图片尺寸用于防止布局抖动
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
        // 添加尺寸属性防止布局抖动 (CLS)
        ...(dimensions && {
          width: dimensions.width,
          height: dimensions.height,
          "data-aspect-ratio": aspectRatio,
        }),
      };

      // 添加 aspect-ratio 样式到 style 属性
      if (aspectRatio) {
        const existingStyle = String(element.properties.style ?? "");
        element.properties.style = existingStyle
          ? `${existingStyle}; aspect-ratio: ${aspectRatio};`.trim()
          : `aspect-ratio: ${aspectRatio};`;
      }
    });
  };
}
// Rehype 插件：为链接添加 favicon（包括内链和外链）
function linkFaviconPlugin() {
  return function transformer(tree: Root) {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;

      const element = node as Element;
      const href = String(element.properties?.href ?? "");
      if (!href || href.startsWith("#")) return;

      // 解析 URL，判断是内链还是外链
      let url: URL | null = null;
      let domain: string;
      let isExternal = false;

      try {
        url = new URL(href);
        if (url.protocol !== "http:" && url.protocol !== "https:") return;
        
        const hostname = url.hostname.toLowerCase();
        isExternal = !internalHostnames.has(hostname);
        domain = hostname;
      } catch {
        // 相对路径或无效 URL，视为内链
        const siteUrl = new URL(siteConfig.siteUrl);
        domain = siteUrl.hostname.toLowerCase();
      }

      // 获取链接的子元素
      const children = element.children || [];
      // 检查是否已经有 favicon（避免重复）
      const hasFavicon = children.some((child) => {
        if (child.type !== "element") return false;
        const childEl = child as Element;
        const classNames = getClassNames(childEl.properties?.className);
        return (
          childEl.tagName === "span" &&
          classNames.includes("favicon-wrapper")
        );
      });

      // 创建 favicon 图片元素
      const faviconImg: Element = {
        type: "element",
        tagName: "img",
        properties: {
          className: ["favicon"],
          src: getFaviconUrl(domain),
          alt: "",
          loading: "lazy",
        },
        children: [],
      };

      // 创建 wrapper
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

      // 外链添加额外属性
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
        // 内链只添加 favicon，不添加新标签页等属性
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

function parsePostContent(filePath: string, raw: string): PostItem | null {
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  if (!frontmatter.title || !frontmatter.date || frontmatter.hide) {
    return null;
  }

  // Extract slug from file path
  const slug = filePath
    .replace("/content/posts/", "")
    .replace(/\.md$/, "")
    .replace(/\//g, "-");
  const stats = readingTime(content);

  return {
    slug,
    url: `/${slug}`,
    title: frontmatter.title,
    date: formatDate(frontmatter.date),
    dateTime: new Date(frontmatter.date).getTime(),
    formatShowDate: formatShowDate(frontmatter.date),
    cover: frontmatter.cover,
    categories: frontmatter.categories ?? [],
    excerpt: frontmatter.description ?? extractExcerpt(content),
    readingTime: `${Math.max(1, Math.round(stats.minutes))} 分钟`,
  };
}

export const getAllPosts = cache((): PostItem[] => {
  const posts: PostItem[] = [];

  for (const [filePath, content] of Object.entries(markdownFiles)) {
    const post = parsePostContent(filePath, content as string);
    if (post) {
      posts.push(post);
    }
  }

  return posts.sort((a, b) => b.dateTime - a.dateTime);
});

export const getCategoryMeta = cache(() => {
  const map = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const category of post.categories) {
      map.set(category, (map.get(category) ?? 0) + 1);
    }
  }
  return map;
});

export const getSearchDocuments = cache((): SearchDocument[] => {
  const docs: SearchDocument[] = [];

  for (const [filePath, content] of Object.entries(markdownFiles)) {
    const raw = content as string;
    const { data, content: markdownContent } = matter(raw);
    const frontmatter = data as PostFrontmatter;

    if (!frontmatter.title || !frontmatter.date || frontmatter.hide) {
      continue;
    }

    const slug = filePath
      .replace("/content/posts/", "")
      .replace(/\.md$/, "")
      .replace(/\//g, "-");
    const searchableContent = stripMarkdown(markdownContent).slice(0, 4000);
    const aiSummary = getAISummary(slug);
    docs.push({
      id: slug,
      title: frontmatter.title,
      url: `/${slug}`,
      cover: frontmatter.cover ? getPreviewImage(frontmatter.cover) : undefined,
      excerpt: frontmatter.description ?? extractExcerpt(markdownContent),
      content: searchableContent,
      categories: frontmatter.categories ?? [],
      dateTime: new Date(frontmatter.date).getTime(),
      keyPoints: aiSummary?.keyPoints,
    });
  }

  return docs;
});

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  // Try to find the file by constructing possible paths
  const possiblePaths = [
    `/content/posts/${slug}.md`,
    `/content/posts/${slug.replace(/-/g, "/")}.md`,
  ];

  let raw: string | undefined;

  for (const path of possiblePaths) {
    if (markdownFiles[path]) {
      raw = markdownFiles[path] as string;
      break;
    }
  }

  // If not found directly, search through all files
  if (!raw) {
    for (const [filePath, content] of Object.entries(markdownFiles)) {
      const fileSlug = filePath
        .replace("/content/posts/", "")
        .replace(/\.md$/, "")
        .replace(/\//g, "-");
      if (fileSlug === slug) {
        raw = content as string;
        break;
      }
    }
  }

  if (!raw) return null;

  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;
  if (!frontmatter.title || !frontmatter.date || frontmatter.hide) return null;

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
  const headings = extractHeadingsFromHtml(html);

  const stats = readingTime(content);

  return {
    slug,
    url: `/${slug}`,
    title: frontmatter.title,
    date: formatDate(frontmatter.date),
    dateTime: new Date(frontmatter.date).getTime(),
    formatShowDate: formatShowDate(frontmatter.date),
    cover: frontmatter.cover,
    categories: frontmatter.categories ?? [],
    excerpt: frontmatter.description ?? extractExcerpt(content),
    readingTime: `${Math.max(1, Math.round(stats.minutes))} 分钟`,
    headings,
    html,
  };
}

/**
 * Get raw markdown content for a post by slug (used by RSS feed)
 */
export function getPostRawContent(slug: string): string | null {
  for (const [filePath, content] of Object.entries(markdownFiles)) {
    const fileSlug = filePath
      .replace("/content/posts/", "")
      .replace(/\.md$/, "")
      .replace(/\//g, "-");
    if (fileSlug === slug) {
      const { content: markdownContent } = matter(content as string);
      return markdownContent;
    }
  }
  return null;
}

export function getPostSiblings(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    prev: index >= 0 ? (posts[index - 1] ?? null) : null,
    next: index >= 0 ? (posts[index + 1] ?? null) : null,
  };
}
