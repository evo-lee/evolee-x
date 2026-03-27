import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { getRuntimePosts } from '@/lib/content/runtime';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = buildPageMetadata({
  path: '/posts',
  title: 'Posts',
  description: 'All published posts.',
});

export default async function PostsPage() {
  const posts = getRuntimePosts();
  const structuredData = buildCollectionPageStructuredData({
    title: 'Posts',
    description: 'All published posts.',
    path: '/posts',
  });

  return (
    <CollectionPage
      description="Chronological notes on software, books, and whatever else proved worth keeping."
      eyebrow="Posts"
      structuredData={structuredData}
      title="All writing"
    >
      <PostList posts={posts} emptyLabel="No published posts yet." />
    </CollectionPage>
  );
}
