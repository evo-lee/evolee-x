import runtimeData from '@/content/.generated/runtime-data.json';
import { groupPostsByMonth } from '@/lib/format';
import type { AppLocale } from '@/lib/i18n/config';
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

function selectLocalizedItems<T extends { slug: string; locale: AppLocale }>(
  items: T[],
  locale: AppLocale
): T[] {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    grouped.set(item.slug, [...(grouped.get(item.slug) || []), item]);
  }

  return [...grouped.values()].flatMap((variants) => {
    const exact = variants.find((variant) => variant.locale === locale);
    if (exact) return [exact];

    const chinese = variants.find((variant) => variant.locale === 'zh-CN');
    return chinese ? [chinese] : [];
  });
}

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

export function getRuntimePostVariants(): PostSummary[] {
  return snapshot.posts
    .map(revivePostSummary)
    .sort((left, right) => right.date.getTime() - left.date.getTime());
}

export function getRuntimePosts(locale: AppLocale = 'zh-CN'): PostSummary[] {
  return selectLocalizedItems(getRuntimePostVariants(), locale);
}

export function getRuntimePostBySlug(slug: string, locale: AppLocale = 'zh-CN'): Post | null {
  const exact = snapshot.postMap[`${slug}:${locale}`];
  if (exact) return revivePost(exact);

  const entry = snapshot.postMap[`${slug}:zh-CN`] ?? snapshot.postMap[slug];
  return entry ? revivePost(entry) : null;
}

export function getRuntimePostsByTag(tag: string, locale: AppLocale = 'zh-CN'): PostSummary[] {
  return getRuntimePosts(locale).filter((post) => post.tags.includes(tag));
}

export function getRuntimePostsByCategory(
  category: string,
  locale: AppLocale = 'zh-CN'
): PostSummary[] {
  return getRuntimePosts(locale).filter((post) => post.category === category);
}

export function getRuntimePages(locale?: AppLocale): Page[] {
  const pages = snapshot.pages.map(revivePage);
  return locale ? selectLocalizedItems(pages, locale) : pages;
}

export function getRuntimePageBySlug(slug: string, locale: AppLocale = 'zh-CN'): Page | null {
  return getRuntimePages(locale).find((page) => page.slug === slug) ?? null;
}

export function getRuntimeTags(locale: AppLocale = 'zh-CN'): string[] {
  return Array.from(new Set(getRuntimePosts(locale).flatMap((post) => post.tags))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getRuntimeCategories(locale: AppLocale = 'zh-CN'): string[] {
  return Array.from(
    new Set(
      getRuntimePosts(locale)
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category))
    )
  ).sort((a, b) => a.localeCompare(b));
}

export function getRuntimeTagCounts(locale: AppLocale = 'zh-CN'): Record<string, number> {
  return getRuntimePosts(locale).reduce<Record<string, number>>((counts, post) => {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
    return counts;
  }, {});
}

export function getRuntimeArchives(locale: AppLocale = 'zh-CN') {
  return groupPostsByMonth(getRuntimePosts(locale));
}

export function getRuntimeRelatedPosts(
  sourcePost: Pick<PostSummary, 'slug' | 'tags' | 'category'>,
  locale: AppLocale = 'zh-CN',
  limit = 3
): PostSummary[] {
  const posts = getRuntimePosts(locale);

  return posts
    .filter((post) => post.slug !== sourcePost.slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => sourcePost.tags.includes(tag)).length;
      const sameCategory = sourcePost.category && post.category === sourcePost.category ? 2 : 0;

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
