import { NextResponse, type NextRequest } from 'next/server';
import { isAppLocale } from '@/lib/i18n/config';
import { detectLocaleFromRequest } from '@/lib/i18n/detect';

export const config = {
  matcher: [
    '/((?!_next/|api/|image/|sitemap\\.xml|robots\\.txt|rss\\.xml|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js|map)$).*)',
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split('/')[1];

  if (isAppLocale(firstSegment)) {
    return NextResponse.next();
  }

  const locale = detectLocaleFromRequest(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(url, 308);
}
