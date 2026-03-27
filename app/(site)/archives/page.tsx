import type { Metadata } from 'next';
import { ArchiveList } from '@/components/site/ArchiveList';
import { CollectionPage } from '@/components/site/CollectionPage';
import { getRuntimeArchives } from '@/lib/content/runtime';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = buildPageMetadata({
  path: '/archives',
  title: 'Archives',
  description: 'Browse posts by month.',
});

export default async function ArchivesPage() {
  const groups = getRuntimeArchives();
  const structuredData = buildCollectionPageStructuredData({
    title: 'Archives',
    description: 'Browse posts by month.',
    path: '/archives',
  });

  return (
    <CollectionPage
      description="A chronological shelf of published writing."
      eyebrow="Archives"
      structuredData={structuredData}
      title="Monthly index"
    >
      <ArchiveList groups={groups} />
    </CollectionPage>
  );
}
