import Link from 'next/link';
import { EmptyState } from '@/components/site/EmptyState';
import { PostMeta } from '@/components/site/PostMeta';
import { TagList } from '@/components/site/TagList';
import { ArticleImage } from '@/components/ui/ArticleImage';
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
        <li key={post.slug} className="post-list__item">
          <PostMeta post={post} />
          <div className="post-list__body">
            <Link className="post-list__cover" href={post.url} aria-hidden="true" tabIndex={-1}>
              <ArticleImage
                alt={post.coverImage.alt}
                priority={post.featured}
                src={post.coverImage.src}
                variant="thumb-md"
              />
            </Link>
            <h2>
              <Link href={post.url}>{post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
            <TagList ariaLabel={`${post.title} tags`} tags={post.tags} />
          </div>
        </li>
      ))}
    </ul>
  );
}
