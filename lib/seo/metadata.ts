import type { Metadata } from 'next';
import type { Page, Post, PostSummary } from '@/lib/content/types';
import { getImageUrl } from '@/lib/cloudflare/images';
import type { AppLocale } from '@/lib/i18n/config';
import { getSeoConfig } from './constants';
import { buildOpenGraph } from './og';

type MetadataOptions = {
  locale?: AppLocale;
  path: string;
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
};

/**
 * Build site-wide metadata used by the root layout.
 *
 * @returns The default title template, description, authors, and share image metadata.
 */
export function buildSiteMetadata(locale: AppLocale): Metadata {
  const seoConfig = getSeoConfig(locale);

  return {
    applicationName: seoConfig.siteName,
    title: {
      default: seoConfig.siteTitle,
      template: `%s | ${seoConfig.siteName}`,
    },
    description: seoConfig.siteDescription,
    metadataBase: new URL(seoConfig.baseUrl),
    alternates: {
      canonical: seoConfig.baseUrl,
    },
    openGraph: buildOpenGraph({
      locale,
      title: seoConfig.siteTitle,
      description: seoConfig.siteDescription,
      url: seoConfig.baseUrl,
      image: getImageUrl(seoConfig.defaultOgImage, 'og-cover', { absolute: true }),
    }),
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.siteTitle,
      description: seoConfig.siteDescription,
      images: [getImageUrl(seoConfig.defaultOgImage, 'og-cover', { absolute: true })],
    },
    authors: [{ name: seoConfig.author.name, url: seoConfig.author.url }],
  };
}

/**
 * Build metadata for generic collection pages and static routes.
 *
 * @param options Route path, title, description, optional share image, and noindex flag.
 * @returns Next.js metadata object with canonical, OG, Twitter, and robots fields.
 */
export function buildPageMetadata({
  locale = 'zh-CN',
  path,
  title,
  description,
  image,
  noIndex,
}: MetadataOptions): Metadata {
  const seoConfig = getSeoConfig(locale);
  const url = path === '/' ? seoConfig.baseUrl : `${seoConfig.baseUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: buildOpenGraph({
      locale,
      title,
      description,
      url,
      image: getImageUrl(image || seoConfig.defaultOgImage, 'og-cover', { absolute: true }),
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getImageUrl(image || seoConfig.defaultOgImage, 'og-cover', { absolute: true })],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

/**
 * Build metadata for an individual blog post.
 *
 * @param post Post summary or full post entity.
 * @returns Article-specific metadata with canonical, OG, Twitter, authors, keywords, and draft robots policy.
 */
export function buildPostMetadata(post: Post | PostSummary): Metadata {
  const seoConfig = getSeoConfig(post.locale);
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.description;
  const url = post.url === '/' ? seoConfig.baseUrl : `${seoConfig.baseUrl}${post.url}`;

  return {
    title,
    description,
    alternates: {
      canonical: post.canonical || url,
    },
    openGraph: buildOpenGraph({
      locale: post.locale,
      title,
      description,
      url,
      image: getImageUrl(post.ogImage || post.cover || post.coverImage.src, 'og-cover', {
        absolute: true,
      }),
      type: 'article',
      publishedTime: post.date.toISOString(),
      modifiedTime: (post.updated || post.date).toISOString(),
      tags: post.tags,
    }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        getImageUrl(post.ogImage || post.cover || post.coverImage.src, 'og-cover', {
          absolute: true,
        }),
      ],
    },
    authors: post.author ? [{ name: post.author }] : [{ name: seoConfig.author.name }],
    category: post.category,
    keywords: post.tags,
    robots: post.draft
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

/**
 * Build metadata for a Markdown-backed content page such as About.
 *
 * @param page Runtime page entity.
 * @returns Generic page metadata derived from the page model.
 */
export function buildPageContentMetadata(page: Page): Metadata {
  return buildPageMetadata({
    locale: page.locale,
    path: page.url,
    title: page.title,
    description: page.description,
    noIndex: page.draft,
  });
}
