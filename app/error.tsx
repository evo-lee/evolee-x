'use client';

import { useEffect } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale =
    typeof document !== 'undefined' &&
    (document.documentElement.lang === 'en' || document.documentElement.lang === 'zh-CN')
      ? document.documentElement.lang
      : DEFAULT_LOCALE;
  const messages = getLocaleMessages(locale);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <div className="error-panel">
          <p className="meta-note">{messages.pages.error.eyebrow}</p>
          <h1>{messages.pages.error.title}</h1>
          <p>{error.message}</p>
          <button className="chip-link" onClick={() => reset()} type="button">
            {messages.pages.error.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
