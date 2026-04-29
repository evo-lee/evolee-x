import type { Metadata } from 'next';
import { Pagination } from '@/components/layout/Pagination';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { SiteLayout } from '@/components/site/SiteLayout';
import { getRuntimePosts } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { APP_LOCALES } from '@/lib/i18n/config';
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
    path: '/posts',
    title: messages.pages.posts.metadataTitle,
    description: messages.pages.posts.metadataDescription,
  });
}

export default async function PostsPage({ params }: PageProps) {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);
  const posts = getRuntimePosts(locale);
  const totalPages = Math.max(1, Math.ceil(posts.length / 10));

  return (
    <SiteLayout locale={locale}>
      <CollectionPage
        description={messages.pages.posts.description}
        eyebrow={messages.pages.posts.eyebrow}
        structuredData={buildCollectionPageStructuredData({
          locale,
          title: messages.pages.posts.metadataTitle,
          description: messages.pages.posts.metadataDescription,
          path: '/posts',
        })}
        title={messages.pages.posts.title}
      >
        <PostList posts={posts} emptyLabel={messages.pages.posts.empty} locale={locale} />
        <Pagination basePath={`/${locale}/posts`} currentPage={1} locale={locale} totalPages={totalPages} />
      </CollectionPage>
    </SiteLayout>
  );
}
