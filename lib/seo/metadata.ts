import type { Metadata } from 'next';
import type { Page, Post, PostSummary } from '@/lib/content/types';
import { getImageUrl } from '@/lib/cloudflare/images';
import { seoConfig } from './constants';
import { buildOpenGraph } from './og';

type MetadataOptions = {
  path: string;
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
};

function absoluteUrl(path: string): string {
  return path === '/' ? seoConfig.baseUrl : `${seoConfig.baseUrl}${path}`;
}

export function buildSiteMetadata(): Metadata {
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

export function buildPageMetadata({
  path,
  title,
  description,
  image,
  noIndex,
}: MetadataOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: buildOpenGraph({
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

export function buildPostMetadata(post: Post | PostSummary): Metadata {
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.description;
  const url = absoluteUrl(post.url);

  return {
    title,
    description,
    alternates: {
      canonical: post.canonical || url,
    },
    openGraph: buildOpenGraph({
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

export function buildPageContentMetadata(page: Page): Metadata {
  return buildPageMetadata({
    path: page.url,
    title: page.title,
    description: page.description,
    noIndex: page.draft,
  });
}
