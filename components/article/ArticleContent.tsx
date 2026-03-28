import { ArticleToc } from '@/components/article/ArticleToc';
import { ArticleTypography } from '@/components/article/ArticleTypography';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import type { Heading } from '@/lib/content/types';

export async function ArticleContent({
  html,
  headings,
  scope,
  enableTypography = true,
}: {
  html: string;
  headings: Heading[];
  scope: string;
  enableTypography?: boolean;
}) {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const selector = `[data-article-content="${scope}"]`;

  return (
    <div className="article-layout">
      <article className="prose-panel">
        {enableTypography ? <ArticleTypography selector={selector} /> : null}
        <div
          className="prose article-prose"
          data-article-content={scope}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
      <ArticleToc
        headings={headings}
        ariaLabel={messages.article.tocAriaLabel}
        title={messages.article.tocTitle}
      />
    </div>
  );
}
