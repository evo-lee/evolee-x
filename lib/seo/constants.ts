import { siteConfig } from '@/lib/site';

export const seoConfig = {
  siteName: siteConfig.name,
  siteTitle: siteConfig.title,
  siteDescription: siteConfig.description,
  baseUrl: siteConfig.baseUrl,
  locale: siteConfig.locale,
  defaultOgImage: `${siteConfig.baseUrl}/og-default.svg`,
  author: {
    name: siteConfig.author,
    url: siteConfig.baseUrl,
  },
} as const;

