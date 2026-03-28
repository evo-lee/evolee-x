import type { AppLocale } from '@/lib/i18n/config';
import { getSiteConfig } from '@/lib/site';

export function getSeoConfig(locale: AppLocale) {
  const siteConfig = getSiteConfig(locale);

  return {
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
}
