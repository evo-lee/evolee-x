import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getSiteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const siteConfig = getSiteConfig(DEFAULT_LOCALE);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
  };
}
