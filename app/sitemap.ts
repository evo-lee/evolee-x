import type { MetadataRoute } from 'next';
import {
  APP_LOCALES,
  DEFAULT_LOCALE,
  type AppLocale,
} from '@/lib/i18n/config';
import { localeHref } from '@/lib/i18n/route';
import {
  getRuntimeCategories,
  getRuntimePostBySlug,
  getRuntimePostLocalesBySlug,
  getRuntimePostVariants,
  getRuntimeTags,
} from '@/lib/content/runtime';
import { getSiteConfig } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteConfig = getSiteConfig(DEFAULT_LOCALE);
  const posts = getRuntimePostVariants();
  const tags = getRuntimeTags();
  const categories = getRuntimeCategories();
  const slugs = Array.from(new Set(posts.map((post) => post.slug)));

  function languages(paths: [AppLocale, string][]) {
    return Object.fromEntries(paths.map(([locale, path]) => [locale, `${siteConfig.baseUrl}${path}`]));
  }

  const staticRoutes = ['', '/posts', '/archives', '/about', '/projects'].flatMap((path) => {
    const canonicalPath = localeHref(DEFAULT_LOCALE, path || '/');
    return [{
      url: `${siteConfig.baseUrl}${canonicalPath}`,
      alternates: {
        languages: languages(APP_LOCALES.map((locale) => [locale, localeHref(locale, path || '/')]))
      },
    }];
  });

  const postRoutes = slugs.flatMap((slug) => {
    const locales = getRuntimePostLocalesBySlug(slug);
    if (locales.length === 0) {
      return [];
    }

    const primaryLocale = locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0];
    const primaryPost = getRuntimePostBySlug(slug, primaryLocale);
    if (!primaryPost) {
      return [];
    }

    return [{
      url: `${siteConfig.baseUrl}${primaryPost.url}`,
      lastModified: primaryPost.updated || primaryPost.date,
      alternates: {
        languages: languages(locales.map((locale) => [locale, localeHref(locale, `/posts/${slug}`)])),
      },
    }];
  });

  const tagRoutes = tags.flatMap((tag) => [{
    url: `${siteConfig.baseUrl}${localeHref(DEFAULT_LOCALE, `/tags/${encodeURIComponent(tag)}`)}`,
    alternates: {
      languages: languages(
        APP_LOCALES.map((locale) => [locale, localeHref(locale, `/tags/${encodeURIComponent(tag)}`)])
      ),
    },
  }]);

  const categoryRoutes = categories.flatMap((category) => [{
    url: `${siteConfig.baseUrl}${localeHref(DEFAULT_LOCALE, `/categories/${encodeURIComponent(category)}`)}`,
    alternates: {
      languages: languages(
        APP_LOCALES.map((locale) => [
          locale,
          localeHref(locale, `/categories/${encodeURIComponent(category)}`),
        ])
      ),
    },
  }]);

  return [...staticRoutes, ...postRoutes, ...tagRoutes, ...categoryRoutes];
}
