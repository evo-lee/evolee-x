import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { SearchDocument } from "@luoleiorg/search-core";
import type { PostDetail, PostFrontmatter, PostItem } from "./types";
import { getAISummary } from "./ai-data";
import { renderPostHtml } from "./post-markdown";
import {
  formatDate,
  formatShowDate,
  getPreviewImage,
} from "./utils";

// Use Vite's import.meta.glob to load markdown files at build time
const markdownFiles = import.meta.glob("/content/posts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

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

function filePathToSlug(filePath: string): string {
  return filePath
    .replace("/content/posts/", "")
    .replace(/\.md$/, "")
    .replace(/\//g, "-");
}

function getPossiblePostPaths(slug: string): string[] {
  return [
    `/content/posts/${slug}.md`,
    `/content/posts/${slug.replace(/-/g, "/")}.md`,
  ];
}

function findRawMarkdownBySlug(slug: string): string | null {
  for (const path of getPossiblePostPaths(slug)) {
    if (markdownFiles[path]) {
      return markdownFiles[path] as string;
    }
  }

  for (const [filePath, content] of Object.entries(markdownFiles)) {
    if (filePathToSlug(filePath) === slug) {
      return content as string;
    }
  }

  return null;
}

function parsePostContent(filePath: string, raw: string): PostItem | null {
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  if (!frontmatter.title || !frontmatter.date || frontmatter.hide) {
    return null;
  }

  // Extract slug from file path
  const slug = filePathToSlug(filePath);
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

    const slug = filePathToSlug(filePath);
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
  const raw = findRawMarkdownBySlug(slug);
  if (!raw) return null;

  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;
  if (!frontmatter.title || !frontmatter.date || frontmatter.hide) return null;

  const { html, headings } = await renderPostHtml(content);

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
    if (filePathToSlug(filePath) === slug) {
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
