'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDate, formatReadTime } from '@/lib/format';
import { getLocalePrefix, withLocalePrefix } from '@/lib/i18n/routes';
import type { PostSummary } from '@/lib/content/types';
import { CoverPlaceholder, pickCoverColor } from './CoverPlaceholder';

export function PostCard({ post, featured = false }: { post: PostSummary; featured?: boolean }) {
  const cardClass = featured ? 'post-card post-card--featured' : 'post-card';
  const coverClass = featured ? 'post-card__cover post-card__cover--featured' : 'post-card__cover';
  const readTime = formatReadTime(post.excerpt || post.description || post.title);
  const pathname = usePathname() || '/';
  const localePrefix = getLocalePrefix(pathname);

  return (
    <Link href={withLocalePrefix(post.url, localePrefix)} className={cardClass}>
      <div className={coverClass}>
        {post.coverImage?.src && post.coverImage.source !== 'default' ? (
          <img
            src={post.coverImage.src}
            alt={post.coverImage.alt || post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <CoverPlaceholder color={pickCoverColor(post.slug)} />
        )}
      </div>
      <div className="post-card__body">
        <div className="post-card__meta">
          <span>{formatDate(post.date)}</span>
          <span className="post-card__meta-dot">·</span>
          <span>{readTime}</span>
        </div>
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt || post.description}</p>
        {post.tags.length > 0 && (
          <div className="tag-row">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
