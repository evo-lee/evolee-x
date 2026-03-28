import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';

export default async function Loading() {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  return (
    <div className="loading-panel">
      <p className="meta-note">{messages.pages.loading.eyebrow}</p>
      <h1>{messages.pages.loading.title}</h1>
      <p>{messages.pages.loading.description}</p>
    </div>
  );
}
