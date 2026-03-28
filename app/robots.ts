import type { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const siteConfig = getSiteConfig('zh-CN');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
  };
}
