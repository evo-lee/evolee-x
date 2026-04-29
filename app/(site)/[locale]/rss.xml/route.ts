import { getRuntimePosts } from '@/lib/content/runtime';
import { isAppLocale, type AppLocale } from '@/lib/i18n/config';
import { getSiteConfig } from '@/lib/site';

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    return new Response('Not Found', { status: 404 });
  }

  const siteConfig = getSiteConfig(locale as AppLocale);
  const posts = getRuntimePosts(locale as AppLocale);
  const items = posts
    .map(
      (post) => `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${siteConfig.baseUrl}${post.url}</link>
          <guid>${siteConfig.baseUrl}${post.url}</guid>
          <pubDate>${post.date.toUTCString()}</pubDate>
          <description>${escapeXml(post.description)}</description>
        </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>${escapeXml(siteConfig.title)}</title>
      <link>${siteConfig.baseUrl}/${locale}</link>
      <description>${escapeXml(siteConfig.description)}</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
