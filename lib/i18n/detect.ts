import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import {
  LOCALE_COOKIE_NAME,
  isAppLocale,
  isChineseMainlandCountry,
  normalizeLocale,
  type AppLocale,
} from './config';

export const detectRequestLocale = cache(async (): Promise<AppLocale> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isAppLocale(cookieLocale)) {
    return cookieLocale;
  }

  const requestHeaders = await headers();
  const country =
    requestHeaders.get('cf-ipcountry') ||
    requestHeaders.get('x-vercel-ip-country') ||
    requestHeaders.get('x-country');

  if (isChineseMainlandCountry(country)) {
    return 'zh-CN';
  }

  return normalizeLocale(requestHeaders.get('accept-language'));
});
