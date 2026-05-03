'use client';

import { useEffect } from 'react';
import { initHetiForArticle } from '@/lib/typography/heti-client';

const SELECTOR = '[data-article-content="article"]';

export function ArticleBody({ html }: { html: string }) {
  useEffect(() => {
    void initHetiForArticle(SELECTOR);
  }, [html]);

  return (
    <div
      className="article-body"
      data-article-content="article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
