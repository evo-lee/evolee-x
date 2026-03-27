import type { Page, Post } from '@/lib/content/types';
import { getImageUrl } from '@/lib/cloudflare/images';
import { seoConfig } from './constants';

function absoluteUrl(path: string): string {
  return path === '/' ? seoConfig.baseUrl : `${seoConfig.baseUrl}${path}`;
}

export function buildPersonStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: seoConfig.author.name,
    url: seoConfig.author.url,
  };
}

export function buildWebsiteStructuredData() {
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
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl(path),
  };
}

export function buildPageStructuredData(page: Page) {
  return buildCollectionPageStructuredData({
    title: page.title,
    description: page.description,
    path: page.url,
  });
}

export function buildBreadcrumbStructuredData(
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
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildBlogPostingStructuredData(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.description,
    datePublished: post.date.toISOString(),
    dateModified: (post.updated || post.date).toISOString(),
    url: post.canonical || absoluteUrl(post.url),
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
