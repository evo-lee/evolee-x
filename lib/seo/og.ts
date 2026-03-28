import type { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import type { AppLocale } from '@/lib/i18n/config';
import { getSeoConfig } from './constants';

function resolveImageUrl(locale: AppLocale, image?: string): string {
  const seoConfig = getSeoConfig(locale);

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
  locale,
  title,
  description,
  url,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
}: {
  locale: AppLocale;
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}): OpenGraph {
  const seoConfig = getSeoConfig(locale);

  return {
    title,
    description,
    url,
    siteName: seoConfig.siteName,
    locale: seoConfig.locale,
    type,
    images: [
      {
        url: resolveImageUrl(locale, image),
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
