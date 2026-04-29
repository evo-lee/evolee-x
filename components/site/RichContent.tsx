import { ArticleContent } from '@/components/article/ArticleContent';
import type { AppLocale } from '@/lib/i18n/config';
import type { Heading } from '@/lib/content/types';

export function RichContent({
  html,
  headings,
  locale,
  scope = 'default-article',
}: {
  html: string;
  headings: Heading[];
  locale: AppLocale;
  scope?: string;
}) {
  return <ArticleContent headings={headings} html={html} locale={locale} scope={scope} />;
}
