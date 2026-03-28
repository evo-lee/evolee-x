import { cache } from 'react';
import { headers } from 'next/headers';
import { isChineseMainlandCountry, normalizeLocale, type AppLocale } from './config';

export const detectRequestLocale = cache(async (): Promise<AppLocale> => {
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
