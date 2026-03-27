import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
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

  return (
    <section className="page-grid">
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Posts',
          description: 'All published posts.',
          path: '/posts',
        })}
      />
      <header className="page-header">
        <p className="meta-note">Posts</p>
        <h1>All writing</h1>
        <p>Chronological notes on software, books, and whatever else proved worth keeping.</p>
      </header>
      <PostList posts={posts} emptyLabel="No published posts yet." />
    </section>
  );
}
