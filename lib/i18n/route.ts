import { notFound } from 'next/navigation';
import {
  APP_LOCALES,
  isAppLocale,
  type AppLocale,
} from './config';

export function resolveRouteLocale(params: { locale: string }): AppLocale {
  const locale = params?.locale;

  if (!isAppLocale(locale)) {
    notFound();
  }

  return locale;
}

export function localeHref(locale: AppLocale, path: string): string {
  if (path === '/') {
    return `/${locale}`;
  }

  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] && APP_LOCALES.includes(segments[0] as AppLocale)) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '';
}
