import Link from 'next/link';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';

export default async function NotFound() {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  return (
    <div className="error-panel">
      <p className="meta-note">404</p>
      <h1>{messages.pages.notFound.title}</h1>
      <p>{messages.pages.notFound.description}</p>
      <p>
        <Link href="/">{messages.pages.notFound.backHome}</Link>
      </p>
    </div>
  );
}
