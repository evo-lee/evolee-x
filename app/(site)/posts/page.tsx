import type { Metadata } from 'next';
import { Pagination } from '@/components/layout/Pagination';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { getRuntimePosts } from '@/lib/content/runtime';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: '/posts',
    title: messages.pages.posts.metadataTitle,
    description: messages.pages.posts.metadataDescription,
  });
}

export default async function PostsPage() {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const posts = getRuntimePosts(locale);
  const totalPages = Math.max(1, Math.ceil(posts.length / 10));
  const structuredData = buildCollectionPageStructuredData({
    locale,
    title: messages.pages.posts.metadataTitle,
    description: messages.pages.posts.metadataDescription,
    path: '/posts',
  });

  return (
    <CollectionPage
      description={messages.pages.posts.description}
      eyebrow={messages.pages.posts.eyebrow}
      structuredData={structuredData}
      title={messages.pages.posts.title}
    >
      <PostList posts={posts} emptyLabel={messages.pages.posts.empty} />
      <Pagination basePath="/posts" currentPage={1} totalPages={totalPages} />
    </CollectionPage>
  );
}
