import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { localeHref } from '@/lib/i18n/route';

export async function GET() {
  return Response.redirect(new URL(localeHref(DEFAULT_LOCALE, '/rss.xml'), 'https://litang.one'), 308);
}
