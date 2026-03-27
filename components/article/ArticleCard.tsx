import Link from 'next/link';
import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import { TagList } from '@/components/taxonomy/TagList';
import { ArticleImage } from '@/components/ui/ArticleImage';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function ArticleCard({ post }: { post: PostSummary }) {
  return (
    <li className="post-list__item">
      <div className="post-list__meta" data-no-typography="true">
        <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
        {post.category ? (
          <>
            <span className="meta-separator">/</span>
            <CategoryBadge category={post.category} />
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
        <TagList ariaLabel={`${post.title} tags`} compact tags={post.tags} />
      </div>
    </li>
  );
}
