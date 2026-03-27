import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import { TagList } from '@/components/taxonomy/TagList';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { siteConfig } from '@/lib/site';

export function ArticleHeader({ post }: { post: Post }) {
  return (
    <header className="article-header">
      <p className="meta-note">Post</p>
      <h1>{post.title}</h1>
      <p>{post.description}</p>
      <ul className="page-meta" aria-label="Post metadata" data-no-typography="true">
        <li>{formatDate(post.date)}</li>
        <li>{post.author || siteConfig.author}</li>
        {post.category ? (
          <li>
            <CategoryBadge category={post.category} />
          </li>
        ) : null}
      </ul>
      <TagList ariaLabel={`${post.title} tags`} compact tags={post.tags} />
    </header>
  );
}
