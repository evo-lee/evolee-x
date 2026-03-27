import { ArticleContent } from '@/components/article/ArticleContent';
import type { Heading } from '@/lib/content/types';

export function RichContent({
  html,
  headings,
  scope = 'default-article',
}: {
  html: string;
  headings: Heading[];
  scope?: string;
}) {
  return <ArticleContent headings={headings} html={html} scope={scope} />;
}
