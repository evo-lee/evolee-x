import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { EmptyState } from '@/components/site/EmptyState';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = buildPageMetadata({
  path: '/projects',
  title: 'Projects',
  description: 'Current and upcoming work.',
});

export default function ProjectsPage() {
  const structuredData = buildCollectionPageStructuredData({
    title: 'Projects',
    description: 'Current and upcoming work.',
    path: '/projects',
  });

  return (
    <CollectionPage
      description="A placeholder shelf for experiments, shipped tools, and works still taking shape."
      eyebrow="Projects"
      structuredData={structuredData}
      title="Things in progress"
    >
      <div className="section">
        <EmptyState label="No project entries are published yet. This page is ready for structured content in a later phase." />
      </div>
    </CollectionPage>
  );
}
