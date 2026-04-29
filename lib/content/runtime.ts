import runtimeData from '@/content/.generated/runtime-data.json';
import { groupPostsByMonth } from '@/lib/format';
import type { AppLocale } from '@/lib/i18n/config';
import { localeHref } from '@/lib/i18n/route';
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

function localizePostUrl<T extends { locale: AppLocale; slug: string; url: string }>(post: T): T {
  return {
    ...post,
    url: localeHref(post.locale, `/posts/${post.slug}`),
  };
}

function localizePageUrl<T extends { locale: AppLocale; slug: string; url: string }>(page: T): T {
  return {
    ...page,
    url: localeHref(page.locale, `/${page.slug}`),
  };
}

function revivePostSummary(post: RuntimePostSummary): PostSummary {
  return localizePostUrl({
    ...post,
    date: new Date(post.date),
    updated: post.updated ? new Date(post.updated) : undefined,
  });
}

function revivePost(post: RuntimePost): Post {
  return localizePostUrl({
    ...post,
    date: new Date(post.date),
    updated: post.updated ? new Date(post.updated) : undefined,
  });
}

function revivePage(page: RuntimePage): Page {
  return localizePageUrl({
    ...page,
    updated: page.updated ? new Date(page.updated) : undefined,
  });
}

/**
 * Read all post summaries from the build-time runtime snapshot.
 *
 * @returns Post summaries with ISO date strings revived to `Date` objects.
 */
export function getRuntimePostVariants(): PostSummary[] {
  return snapshot.posts
    .map(revivePostSummary)
    .sort((left, right) => right.date.getTime() - left.date.getTime());
}

export function getRuntimePosts(locale: AppLocale): PostSummary[] {
  return getRuntimePostVariants().filter((post) => post.locale === locale);
}

export function getRuntimePostLocalesBySlug(slug: string): AppLocale[] {
  return Array.from(
    new Set(
      getRuntimePostVariants()
        .filter((post) => post.slug === slug)
        .map((post) => post.locale)
    )
  );
}

export function getRuntimePostsBySlug(slug: string): PostSummary[] {
  return getRuntimePostVariants().filter((post) => post.slug === slug);
}

/**
 * Read one full post from the build-time runtime snapshot.
 *
 * @param slug Post slug used as the snapshot map key.
 * @returns Full post object, or `null` if the slug is absent from the snapshot.
 */
export function getRuntimePostBySlug(slug: string, locale: AppLocale = 'zh-CN'): Post | null {
  const exact = snapshot.postMap[`${slug}:${locale}`];
  if (exact && exact.locale === locale) {
    return revivePost(exact);
  }

  return null;
}

/**
 * Get snapshot-backed post summaries for a tag archive page.
 *
 * @param tag Exact tag value.
 * @returns Matching post summaries.
 */
export function getRuntimePostsByTag(tag: string, locale: AppLocale): PostSummary[] {
  return getRuntimePosts(locale).filter((post) => post.tags.includes(tag));
}

/**
 * Get snapshot-backed post summaries for a category archive page.
 *
 * @param category Exact category value.
 * @returns Matching post summaries.
 */
export function getRuntimePostsByCategory(category: string, locale: AppLocale): PostSummary[] {
  return getRuntimePosts(locale).filter((post) => post.category === category);
}

/**
 * Read all content pages from the build-time runtime snapshot.
 *
 * @returns Pages with optional update timestamps revived to `Date` objects.
 */
export function getRuntimePages(locale?: AppLocale): Page[] {
  const pages = snapshot.pages.map(revivePage);
  return locale ? pages.filter((page) => page.locale === locale) : pages;
}

/**
 * Read one content page by slug from the runtime snapshot.
 *
 * @param slug Page slug.
 * @returns Matching page, or `null` if it does not exist in the snapshot.
 */
export function getRuntimePageBySlug(slug: string, locale: AppLocale = 'zh-CN'): Page | null {
  const pages = getRuntimePages(locale);
  const page = pages.find((item) => item.slug === slug);
  return page || null;
}

/**
 * Read the known tag list from the runtime snapshot.
 *
 * @returns Cloned tag array so callers cannot mutate snapshot state.
 */
export function getRuntimeTags(locale?: AppLocale): string[] {
  const posts = locale ? getRuntimePosts(locale) : getRuntimePostVariants();
  return Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) =>
    a.localeCompare(b)
  );
}

/**
 * Read the known category list from the runtime snapshot.
 *
 * @returns Cloned category array so callers cannot mutate snapshot state.
 */
export function getRuntimeCategories(locale?: AppLocale): string[] {
  const posts = locale ? getRuntimePosts(locale) : getRuntimePostVariants();
  return Array.from(
    new Set(
      posts
        .map((post) => post.category)
        .filter((category): category is string => Boolean(category))
    )
  ).sort((a, b) => a.localeCompare(b));
}

/**
 * Read tag counts from the runtime snapshot.
 *
 * @returns Cloned tag count record.
 */
export function getRuntimeTagCounts(locale: AppLocale): Record<string, number> {
  return getRuntimePosts(locale).reduce<Record<string, number>>((counts, post) => {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }

    return counts;
  }, {});
}

/**
 * Group snapshot-backed posts by month for the archives page.
 *
 * @returns Archive buckets produced by `groupPostsByMonth`.
 */
export function getRuntimeArchives(locale: AppLocale) {
  return groupPostsByMonth(getRuntimePosts(locale));
}

/**
 * Rank related posts for a given article using shared tags and category.
 *
 * @param sourcePost Current post or summary.
 * @param limit Maximum number of related posts.
 * @returns Sorted related post summaries.
 */
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
