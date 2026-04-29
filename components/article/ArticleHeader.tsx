import { CategoryBadge } from '@/components/taxonomy/CategoryBadge';
import type { AppLocale } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';
import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import { getSiteConfig } from '@/lib/site';

export async function ArticleHeader({
  post,
  locale,
}: {
  post: Post;
  locale: AppLocale;
}) {
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
            <CategoryBadge category={post.category} locale={locale} />
          </li>
        ) : null}
      </ul>
    </header>
  );
}
