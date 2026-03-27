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

/**
 * Read all post summaries from the build-time runtime snapshot.
 *
 * @returns Post summaries with ISO date strings revived to `Date` objects.
 */
export function getRuntimePosts(): PostSummary[] {
  return snapshot.posts.map(revivePostSummary);
}

/**
 * Read one full post from the build-time runtime snapshot.
 *
 * @param slug Post slug used as the snapshot map key.
 * @returns Full post object, or `null` if the slug is absent from the snapshot.
 */
export function getRuntimePostBySlug(slug: string): Post | null {
  const post = snapshot.postMap[slug];
  return post ? revivePost(post) : null;
}

/**
 * Get snapshot-backed post summaries for a tag archive page.
 *
 * @param tag Exact tag value.
 * @returns Matching post summaries.
 */
export function getRuntimePostsByTag(tag: string): PostSummary[] {
  return getRuntimePosts().filter((post) => post.tags.includes(tag));
}

/**
 * Get snapshot-backed post summaries for a category archive page.
 *
 * @param category Exact category value.
 * @returns Matching post summaries.
 */
export function getRuntimePostsByCategory(category: string): PostSummary[] {
  return getRuntimePosts().filter((post) => post.category === category);
}

/**
 * Read all content pages from the build-time runtime snapshot.
 *
 * @returns Pages with optional update timestamps revived to `Date` objects.
 */
export function getRuntimePages(): Page[] {
  return snapshot.pages.map(revivePage);
}

/**
 * Read one content page by slug from the runtime snapshot.
 *
 * @param slug Page slug.
 * @returns Matching page, or `null` if it does not exist in the snapshot.
 */
export function getRuntimePageBySlug(slug: string): Page | null {
  const page = snapshot.pages.find((item) => item.slug === slug);
  return page ? revivePage(page) : null;
}

/**
 * Read the known tag list from the runtime snapshot.
 *
 * @returns Cloned tag array so callers cannot mutate snapshot state.
 */
export function getRuntimeTags(): string[] {
  return [...snapshot.tags];
}

/**
 * Read the known category list from the runtime snapshot.
 *
 * @returns Cloned category array so callers cannot mutate snapshot state.
 */
export function getRuntimeCategories(): string[] {
  return [...snapshot.categories];
}

/**
 * Read tag counts from the runtime snapshot.
 *
 * @returns Cloned tag count record.
 */
export function getRuntimeTagCounts(): Record<string, number> {
  return { ...snapshot.tagCounts };
}

/**
 * Group snapshot-backed posts by month for the archives page.
 *
 * @returns Archive buckets produced by `groupPostsByMonth`.
 */
export function getRuntimeArchives() {
  return groupPostsByMonth(getRuntimePosts());
}
