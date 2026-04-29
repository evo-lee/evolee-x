'use client';

import type { AppLocale } from '@/lib/i18n/config';
import { LOCALE_COOKIE_NAME } from '@/lib/i18n/config';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
};

const ORDERED_LOCALES: AppLocale[] = ['en', 'zh-CN'];

export function LocaleToggle({
  currentLocale,
  ariaLabel,
}: {
  currentLocale: AppLocale;
  ariaLabel: string;
}) {
  const switchTo = (target: AppLocale) => {
    if (target === currentLocale) return;
    document.cookie = `${LOCALE_COOKIE_NAME}=${target}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
    window.location.reload();
  };

  return (
    <div className="locale-switch" role="group" aria-label={ariaLabel}>
      {ORDERED_LOCALES.map((target, idx) => (
        <span key={target} className="locale-switch__item">
          {idx > 0 ? (
            <span className="locale-switch__sep" aria-hidden="true">
              ·
            </span>
          ) : null}
          {target === currentLocale ? (
            <span className="locale-switch__option is-active" aria-current="true">
              {LOCALE_LABELS[target]}
            </span>
          ) : (
            <button
              type="button"
              className="locale-switch__option"
              onClick={() => switchTo(target)}
            >
              {LOCALE_LABELS[target]}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
