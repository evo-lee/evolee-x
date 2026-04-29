import type { Metadata } from 'next';
import { ArchiveList } from '@/components/site/ArchiveList';
import { CollectionPage } from '@/components/site/CollectionPage';
import { SiteLayout } from '@/components/site/SiteLayout';
import { APP_LOCALES } from '@/lib/i18n/config';
import { getRuntimeArchives } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { resolveRouteLocale } from '@/lib/i18n/route';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return APP_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: '/archives',
    title: messages.pages.archives.metadataTitle,
    description: messages.pages.archives.metadataDescription,
  });
}

export default async function ArchivesPage({ params }: PageProps) {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);

  return (
    <SiteLayout locale={locale}>
      <CollectionPage
        description={messages.pages.archives.description}
        eyebrow={messages.pages.archives.eyebrow}
        structuredData={buildCollectionPageStructuredData({
          locale,
          title: messages.pages.archives.metadataTitle,
          description: messages.pages.archives.metadataDescription,
          path: '/archives',
        })}
        title={messages.pages.archives.title}
      >
        <ArchiveList groups={getRuntimeArchives(locale)} locale={locale} />
      </CollectionPage>
    </SiteLayout>
  );
}
