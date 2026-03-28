import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { EmptyState } from '@/components/site/EmptyState';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: '/projects',
    title: messages.pages.projects.metadataTitle,
    description: messages.pages.projects.metadataDescription,
  });
}

export default async function ProjectsPage() {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const structuredData = buildCollectionPageStructuredData({
    locale,
    title: messages.pages.projects.metadataTitle,
    description: messages.pages.projects.metadataDescription,
    path: '/projects',
  });

  return (
    <CollectionPage
      description={messages.pages.projects.description}
      eyebrow={messages.pages.projects.eyebrow}
      structuredData={structuredData}
      title={messages.pages.projects.title}
    >
      <div className="section">
        <EmptyState label={messages.pages.projects.empty} />
      </div>
    </CollectionPage>
  );
}
