'use client';

import { useEffect } from 'react';
import { initHetiForArticle } from '@/lib/typography/heti-client';

export function ArticleTypography({ selector }: { selector: string }) {
  useEffect(() => {
    void initHetiForArticle(selector);
  }, [selector]);

  return null;
}
