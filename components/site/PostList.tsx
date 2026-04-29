import { ArticleCard } from '@/components/article/ArticleCard';
import type { AppLocale } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { EmptyState } from '@/components/site/EmptyState';
import type { PostSummary } from '@/lib/content/types';

export async function PostList({
  posts,
  emptyLabel,
  locale,
}: {
  posts: PostSummary[];
  emptyLabel?: string;
  locale: AppLocale;
}) {
  const messages = getLocaleMessages(locale);

  if (posts.length === 0) {
    return <EmptyState label={emptyLabel || messages.pages.posts.empty} />;
  }

  return (
    <ul className="post-list">
      {posts.map((post, index) => (
        <ArticleCard key={post.slug} locale={locale} post={post} priority={index === 0} />
      ))}
    </ul>
  );
}
