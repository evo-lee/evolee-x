import type { AppLocale } from '@/lib/i18n/config';
import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function PostMeta({ post, locale }: { post: PostSummary; locale: AppLocale }) {
  return (
    <div className="post-list__meta" data-no-typography="true">
      <time dateTime={post.date.toISOString()}>{formatDate(post.date, locale)}</time>
      {post.category ? (
        <>
          <span className="meta-separator">/</span>
          <CategoryBadge category={post.category} locale={locale} />
        </>
      ) : null}
    </div>
  );
}
