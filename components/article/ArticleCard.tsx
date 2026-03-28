import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import { TagList } from '@/components/taxonomy/TagList';
import { ArticleImage } from '@/components/ui/ArticleImage';
import type { AppLocale } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function ArticleCard({ post, locale }: { post: PostSummary; locale: AppLocale }) {
  const messages = getLocaleMessages(locale);

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
            priority={post.featured}
            src={post.coverImage.src}
            variant="thumb-md"
          />
        </TrackedLink>
        <h2>
          <Link href={post.url}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <TagList ariaLabel={messages.article.tagsAriaLabel(post.title)} compact tags={post.tags} />
      </div>
    </li>
  );
}
