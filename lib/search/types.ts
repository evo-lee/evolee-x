import type { AppLocale } from '@/lib/i18n/config';

export interface SearchDocument {
  locale: AppLocale;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category?: string;
  date: string;
  summary?: string;
}

export interface SearchResult extends SearchDocument {
  score?: number;
}
