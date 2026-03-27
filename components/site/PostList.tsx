import Link from 'next/link';
import { ArticleImage } from '@/components/ui/ArticleImage';
import { formatDate } from '@/lib/format';
import type { PostSummary } from '@/lib/content/types';

export function PostList({
  posts,
  emptyLabel,
}: {
  posts: PostSummary[];
  emptyLabel?: string;
}) {
  if (posts.length === 0) {
    return <p className="empty-state">{emptyLabel || 'No posts yet.'}</p>;
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.slug} className="post-list__item">
          <div className="post-list__meta">
            <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
            {post.category ? (
              <>
                <span className="meta-separator">/</span>
                <Link href={`/categories/${post.category}`}>{post.category}</Link>
              </>
            ) : null}
          </div>
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
            {post.tags.length > 0 ? (
              <ul className="tag-list" aria-label={`${post.title} tags`}>
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/tags/${tag}`}>#{tag}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
