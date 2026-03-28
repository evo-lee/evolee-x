import type { Page, Post } from '@/lib/content/types';
import { getImageUrl } from '@/lib/cloudflare/images';
import type { AppLocale } from '@/lib/i18n/config';
import { getSeoConfig } from './constants';

function absoluteUrl(locale: AppLocale, path: string): string {
  const seoConfig = getSeoConfig(locale);
  return path === '/' ? seoConfig.baseUrl : `${seoConfig.baseUrl}${path}`;
}

export function buildPersonStructuredData(locale: AppLocale) {
  const seoConfig = getSeoConfig(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: seoConfig.author.name,
    url: seoConfig.author.url,
  };
}

export function buildWebsiteStructuredData(locale: AppLocale) {
  const seoConfig = getSeoConfig(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    description: seoConfig.siteDescription,
    url: seoConfig.baseUrl,
    publisher: {
      '@type': 'Person',
      name: seoConfig.author.name,
    },
  };
}

export function buildCollectionPageStructuredData({
  locale = 'zh-CN',
  title,
  description,
  path,
}: {
  locale?: AppLocale;
  title: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl(locale, path),
  };
}

export function buildPageStructuredData(page: Page) {
  return buildCollectionPageStructuredData({
    locale: page.locale,
    title: page.title,
    description: page.description,
    path: page.url,
  });
}

export function buildBreadcrumbStructuredData(
  locale: AppLocale,
  items: Array<{
    name: string;
    path: string;
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

export function buildBlogPostingStructuredData(post: Post) {
  const seoConfig = getSeoConfig(post.locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.description,
    datePublished: post.date.toISOString(),
    dateModified: (post.updated || post.date).toISOString(),
    url: post.canonical || absoluteUrl(post.locale, post.url),
    keywords: post.tags.join(', '),
    articleSection: post.category,
    image: getImageUrl(post.ogImage || post.cover || post.coverImage.src, 'og-cover', { absolute: true }),
    author: {
      '@type': 'Person',
      name: post.author || seoConfig.author.name,
    },
    publisher: {
      '@type': 'Person',
      name: seoConfig.author.name,
    },
  };
}
