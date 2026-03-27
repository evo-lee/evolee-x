import type { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import { seoConfig } from './constants';

function resolveImageUrl(image?: string): string {
  if (!image || image.startsWith('data:')) {
    return seoConfig.defaultOgImage;
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  if (image.startsWith('/')) {
    return `${seoConfig.baseUrl}${image}`;
  }

  return `${seoConfig.baseUrl}/${image.replace(/^\/+/, '')}`;
}

export function buildOpenGraph({
  title,
  description,
  url,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}): OpenGraph {
  return {
    title,
    description,
    url,
    siteName: seoConfig.siteName,
    locale: seoConfig.locale,
    type,
    images: [
      {
        url: resolveImageUrl(image),
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    ...(publishedTime ? { publishedTime } : {}),
    ...(modifiedTime ? { modifiedTime } : {}),
    ...(tags ? { tags } : {}),
  };
}

