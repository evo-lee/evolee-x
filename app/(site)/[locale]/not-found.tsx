import Link from 'next/link';
import { SiteLayout } from '@/components/site/SiteLayout';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { localeHref, resolveRouteLocale } from '@/lib/i18n/route';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedNotFound({ params }: PageProps) {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);

  return (
    <SiteLayout locale={locale}>
      <div className="error-panel">
        <p className="meta-note">404</p>
        <h1>{messages.pages.notFound.title}</h1>
        <p>{messages.pages.notFound.description}</p>
        <p>
          <Link href={localeHref(locale, '/')}>{messages.pages.notFound.backHome}</Link>
        </p>
      </div>
    </SiteLayout>
  );
}
