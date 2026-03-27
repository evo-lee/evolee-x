import { ArticleCard } from '@/components/article/ArticleCard';
import { EmptyState } from '@/components/site/EmptyState';
import type { PostSummary } from '@/lib/content/types';

export function PostList({
  posts,
  emptyLabel,
}: {
  posts: PostSummary[];
  emptyLabel?: string;
}) {
  if (posts.length === 0) {
    return <EmptyState label={emptyLabel || 'No posts yet.'} />;
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <ArticleCard key={post.slug} post={post} />
      ))}
    </ul>
  );
}
