import type { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isAppLocale,
  isChineseMainlandCountry,
  type AppLocale,
} from './config';

export function detectLocaleFromRequest(request: Pick<NextRequest, 'cookies' | 'headers'>): AppLocale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (isAppLocale(cookieLocale)) {
    return cookieLocale;
  }

  const country =
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-country');

  if (isChineseMainlandCountry(country)) {
    return 'zh-CN';
  }

  return DEFAULT_LOCALE;
}
