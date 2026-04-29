import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { EmptyState } from '@/components/site/EmptyState';
import { SiteLayout } from '@/components/site/SiteLayout';
import { APP_LOCALES } from '@/lib/i18n/config';
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
    path: '/projects',
    title: messages.pages.projects.metadataTitle,
    description: messages.pages.projects.metadataDescription,
  });
}

export default async function ProjectsPage({ params }: PageProps) {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);

  return (
    <SiteLayout locale={locale}>
      <CollectionPage
        description={messages.pages.projects.description}
        eyebrow={messages.pages.projects.eyebrow}
        structuredData={buildCollectionPageStructuredData({
          locale,
          title: messages.pages.projects.metadataTitle,
          description: messages.pages.projects.metadataDescription,
          path: '/projects',
        })}
        title={messages.pages.projects.title}
      >
        <div className="section">
          <EmptyState label={messages.pages.projects.empty} />
        </div>
      </CollectionPage>
    </SiteLayout>
  );
}
