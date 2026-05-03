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
  return snapshot.posts
    .map(revivePostSummary)
    .sort((left, right) => right.date.getTime() - left.date.getTime());
}

export function getRuntimePostBySlug(slug: string): Post | null {
  const entry = snapshot.postMap[slug];
  return entry ? revivePost(entry) : null;
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
  return getRuntimePages().find((page) => page.slug === slug) ?? null;
}

export function getRuntimeTags(): string[] {
  return Array.from(new Set(getRuntimePosts().flatMap((post) => post.tags))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getRuntimeCategories(): string[] {
  return Array.from(
    new Set(
      getRuntimePosts()
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category))
    )
  ).sort((a, b) => a.localeCompare(b));
}

export function getRuntimeTagCounts(): Record<string, number> {
  return getRuntimePosts().reduce<Record<string, number>>((counts, post) => {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
    return counts;
  }, {});
}

export function getRuntimeArchives() {
  return groupPostsByMonth(getRuntimePosts());
}

export function getRuntimeRelatedPosts(
  sourcePost: Pick<PostSummary, 'slug' | 'tags' | 'category'>,
  limit = 3
): PostSummary[] {
  const posts = getRuntimePosts();

  return posts
    .filter((post) => post.slug !== sourcePost.slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => sourcePost.tags.includes(tag)).length;
      const sameCategory =
        sourcePost.category && post.category === sourcePost.category ? 2 : 0;

      return {
        post,
        score: sharedTags * 3 + sameCategory,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return right.post.date.getTime() - left.post.date.getTime();
    })
    .slice(0, limit)
    .map((entry) => entry.post);
}
