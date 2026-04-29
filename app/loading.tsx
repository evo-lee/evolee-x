import { DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';

export default async function Loading() {
  const messages = getLocaleMessages(DEFAULT_LOCALE);

  return (
    <div className="loading-panel">
      <p className="meta-note">{messages.pages.loading.eyebrow}</p>
      <h1>{messages.pages.loading.title}</h1>
      <p>{messages.pages.loading.description}</p>
    </div>
  );
}
