export const APP_LOCALES = ['zh-CN', 'en'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export function normalizeLocale(locale?: string | null): AppLocale {
  if (!locale) {
    return DEFAULT_LOCALE;
  }

  return locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export function isChineseMainlandCountry(country?: string | null): boolean {
  return country?.toUpperCase() === 'CN';
}
