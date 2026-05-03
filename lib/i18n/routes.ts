import { APP_LOCALES, isAppLocale, type AppLocale } from './config';

export const LOCALE_PREFIXES = APP_LOCALES.map((locale) => `/${locale}` as const);

export type LocalePrefix = (typeof LOCALE_PREFIXES)[number] | '';

export function prefixToLocale(prefix: LocalePrefix): AppLocale {
  const locale = prefix.replace(/^\//, '');
  return isAppLocale(locale) ? locale : 'zh-CN';
}

export function getLocalePrefix(pathname: string): LocalePrefix {
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return prefix;
    }
  }
  return '';
}

export function stripLocalePrefix(pathname: string): string {
  const prefix = getLocalePrefix(pathname);
  if (!prefix) return pathname || '/';

  const stripped = pathname.slice(prefix.length);
  return stripped || '/';
}

export function withLocalePrefix(href: string, prefix: LocalePrefix): string {
  if (!href.startsWith('/')) return href;

  const pathname = stripLocalePrefix(href);
  if (!prefix) return pathname;

  return pathname === '/' ? prefix : `${prefix}${pathname}`;
}

export function getAlternateLocaleHref(
  pathname: string,
  prefix: Exclude<LocalePrefix, ''>
): string {
  return withLocalePrefix(stripLocalePrefix(pathname), prefix);
}
