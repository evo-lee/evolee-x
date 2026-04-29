import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { SiteLayout } from '@/components/site/SiteLayout';
import { APP_LOCALES } from '@/lib/i18n/config';
import { getRuntimeCategories, getRuntimePostsByCategory } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { resolveRouteLocale } from '@/lib/i18n/route';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
};

export function generateStaticParams() {
  return APP_LOCALES.flatMap((locale) =>
    getRuntimeCategories().map((category) => ({ locale, category }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam, category } = await params;
  const locale = resolveRouteLocale({ locale: localeParam });
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: `/categories/${encodeURIComponent(category)}`,
    title: messages.pages.category.metadataTitle(category),
    description: messages.pages.category.metadataDescription(category),
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale: localeParam, category } = await params;
  const locale = resolveRouteLocale({ locale: localeParam });
  const messages = getLocaleMessages(locale);

  return (
    <SiteLayout locale={locale}>
      <CollectionPage
        description={messages.pages.category.description}
        eyebrow={messages.pages.category.eyebrow}
        structuredData={buildCollectionPageStructuredData({
          locale,
          title: messages.pages.category.metadataTitle(category),
          description: messages.pages.category.metadataDescription(category),
          path: `/categories/${encodeURIComponent(category)}`,
        })}
        title={category}
      >
        <PostList
          posts={getRuntimePostsByCategory(category, locale)}
          emptyLabel={messages.pages.category.empty(category)}
          locale={locale}
        />
      </CollectionPage>
    </SiteLayout>
  );
}
