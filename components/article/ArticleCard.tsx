import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import { ArticleImage } from '@/components/ui/ArticleImage';
import type { AppLocale } from '@/lib/i18n/config';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function ArticleCard({
  post,
  locale,
  priority = false,
}: {
  post: PostSummary;
  locale: AppLocale;
  priority?: boolean;
}) {
  const shouldPrioritizeCover = priority || post.featured || post.coverImage.source === 'default';

  return (
    <li className="post-list__item">
      <div className="post-list__meta" data-no-typography="true">
        <time dateTime={post.date.toISOString()}>{formatDate(post.date, locale)}</time>
        {post.category ? (
          <>
            <span className="meta-separator">/</span>
            <CategoryBadge category={post.category} />
          </>
        ) : null}
      </div>
      <div className="post-list__body">
        <TrackedLink
          className="post-list__cover"
          href={post.url}
          ariaHidden
          eventName="click_cover"
          eventParams={{ slug: post.slug }}
          tabIndex={-1}
        >
          <ArticleImage
            alt={post.coverImage.alt}
            priority={shouldPrioritizeCover}
            src={post.coverImage.src}
            variant="thumb-md"
          />
        </TrackedLink>
        <h2>
          <Link href={post.url}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
      </div>
    </li>
  );
}
