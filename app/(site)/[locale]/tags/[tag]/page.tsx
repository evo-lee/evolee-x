import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { SiteLayout } from '@/components/site/SiteLayout';
import { APP_LOCALES } from '@/lib/i18n/config';
import { getRuntimePostsByTag, getRuntimeTags } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { resolveRouteLocale } from '@/lib/i18n/route';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ locale: string; tag: string }>;
};

export function generateStaticParams() {
  return APP_LOCALES.flatMap((locale) => getRuntimeTags().map((tag) => ({ locale, tag })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam, tag } = await params;
  const locale = resolveRouteLocale({ locale: localeParam });
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: `/tags/${encodeURIComponent(tag)}`,
    title: messages.pages.tag.metadataTitle(tag),
    description: messages.pages.tag.metadataDescription(tag),
  });
}

export default async function TagPage({ params }: PageProps) {
  const { locale: localeParam, tag } = await params;
  const locale = resolveRouteLocale({ locale: localeParam });
  const messages = getLocaleMessages(locale);

  return (
    <SiteLayout locale={locale}>
      <CollectionPage
        description={messages.pages.tag.description}
        eyebrow={messages.pages.tag.eyebrow}
        structuredData={buildCollectionPageStructuredData({
          locale,
          title: messages.pages.tag.metadataTitle(tag),
          description: messages.pages.tag.metadataDescription(tag),
          path: `/tags/${encodeURIComponent(tag)}`,
        })}
        title={`#${tag}`}
      >
        <PostList posts={getRuntimePostsByTag(tag, locale)} emptyLabel={messages.pages.tag.empty(tag)} locale={locale} />
      </CollectionPage>
    </SiteLayout>
  );
}
