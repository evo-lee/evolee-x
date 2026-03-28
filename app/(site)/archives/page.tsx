import type { Metadata } from 'next';
import { ArchiveList } from '@/components/site/ArchiveList';
import { CollectionPage } from '@/components/site/CollectionPage';
import { getRuntimeArchives } from '@/lib/content/runtime';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: '/archives',
    title: messages.pages.archives.metadataTitle,
    description: messages.pages.archives.metadataDescription,
  });
}

export default async function ArchivesPage() {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const groups = getRuntimeArchives(locale);
  const structuredData = buildCollectionPageStructuredData({
    locale,
    title: messages.pages.archives.metadataTitle,
    description: messages.pages.archives.metadataDescription,
    path: '/archives',
  });

  return (
    <CollectionPage
      description={messages.pages.archives.description}
      eyebrow={messages.pages.archives.eyebrow}
      structuredData={structuredData}
      title={messages.pages.archives.title}
    >
      <ArchiveList groups={groups} />
    </CollectionPage>
  );
}
