import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import { TagList } from '@/components/taxonomy/TagList';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { getSiteConfig } from '@/lib/site';

export async function ArticleHeader({ post }: { post: Post }) {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const siteConfig = getSiteConfig(locale);

  return (
    <header className="article-header">
      <p className="meta-note">{messages.article.postEyebrow}</p>
      <h1>{post.title}</h1>
      <p>{post.description}</p>
      <ul
        className="page-meta"
        aria-label={messages.article.metadataAriaLabel}
        data-no-typography="true"
      >
        <li>{formatDate(post.date, locale)}</li>
        <li>{post.author || siteConfig.author}</li>
        {post.category ? (
          <li>
            <CategoryBadge category={post.category} />
          </li>
        ) : null}
      </ul>
      <TagList ariaLabel={messages.article.tagsAriaLabel(post.title)} compact tags={post.tags} />
    </header>
  );
}
