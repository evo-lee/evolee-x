import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function PostMeta({ post }: { post: PostSummary }) {
  return (
    <div className="post-list__meta" data-no-typography="true">
      <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
      {post.category ? (
        <>
          <span className="meta-separator">/</span>
          <CategoryBadge category={post.category} />
        </>
      ) : null}
    </div>
  );
}
