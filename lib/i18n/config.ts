export const APP_LOCALES = ['zh-CN', 'en'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_COOKIE_NAME = 'app-locale';

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'zh-CN' || value === 'en';
}

export function isChineseMainlandCountry(country?: string | null): boolean {
  return country?.toUpperCase() === 'CN';
}
