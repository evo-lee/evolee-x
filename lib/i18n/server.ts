import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from './config';

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

export async function getRequestLocale(searchParams?: SearchParams): Promise<AppLocale> {
  const resolved = searchParams ? await searchParams : undefined;
  const locale = resolved?.__locale;
  const value = Array.isArray(locale) ? locale[0] : locale;

  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}
