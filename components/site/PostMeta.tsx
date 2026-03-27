import Link from 'next/link';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function PostMeta({ post }: { post: PostSummary }) {
  return (
    <div className="post-list__meta">
      <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
      {post.category ? (
        <>
          <span className="meta-separator">/</span>
          <Link href={`/categories/${post.category}`}>{post.category}</Link>
        </>
      ) : null}
    </div>
  );
}
