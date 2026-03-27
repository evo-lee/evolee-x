import runtimeData from '@/content/.generated/runtime-data.json';
import { groupPostsByMonth } from '@/lib/format';
import type { Page, Post, PostSummary } from './types';

type RuntimePage = Omit<Page, 'updated'> & {
  updated?: string;
};

type RuntimePost = Omit<Post, 'date' | 'updated'> & {
  date: string;
  updated?: string;
};

type RuntimePostSummary = Omit<PostSummary, 'date' | 'updated'> & {
  date: string;
  updated?: string;
};

type RuntimeSnapshot = {
  generatedAt: string;
  posts: RuntimePostSummary[];
  postMap: Record<string, RuntimePost>;
  pages: RuntimePage[];
  tags: string[];
  categories: string[];
  tagCounts: Record<string, number>;
};

const snapshot = runtimeData as RuntimeSnapshot;

function revivePostSummary(post: RuntimePostSummary): PostSummary {
  return {
    ...post,
    date: new Date(post.date),
    updated: post.updated ? new Date(post.updated) : undefined,
  };
}

function revivePost(post: RuntimePost): Post {
  return {
    ...post,
    date: new Date(post.date),
    updated: post.updated ? new Date(post.updated) : undefined,
  };
}

function revivePage(page: RuntimePage): Page {
  return {
    ...page,
    updated: page.updated ? new Date(page.updated) : undefined,
  };
}

export function getRuntimePosts(): PostSummary[] {
  return snapshot.posts.map(revivePostSummary);
}

export function getRuntimePostBySlug(slug: string): Post | null {
  const post = snapshot.postMap[slug];
  return post ? revivePost(post) : null;
}

export function getRuntimePostsByTag(tag: string): PostSummary[] {
  return getRuntimePosts().filter((post) => post.tags.includes(tag));
}

export function getRuntimePostsByCategory(category: string): PostSummary[] {
  return getRuntimePosts().filter((post) => post.category === category);
}

export function getRuntimePages(): Page[] {
  return snapshot.pages.map(revivePage);
}

export function getRuntimePageBySlug(slug: string): Page | null {
  const page = snapshot.pages.find((item) => item.slug === slug);
  return page ? revivePage(page) : null;
}

export function getRuntimeTags(): string[] {
  return [...snapshot.tags];
}

export function getRuntimeCategories(): string[] {
  return [...snapshot.categories];
}

export function getRuntimeTagCounts(): Record<string, number> {
  return { ...snapshot.tagCounts };
}

export function getRuntimeArchives() {
  return groupPostsByMonth(getRuntimePosts());
}
