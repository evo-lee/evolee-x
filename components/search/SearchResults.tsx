import Link from 'next/link';
import type { AppLocale } from '@/lib/i18n/config';
import type { SearchResult } from '@/lib/search/types';

export function SearchResults({
  emptyHint,
  query,
  results,
  loading,
  error,
  locale,
  resultsAriaLabel,
  searching,
  onSelect,
}: {
  emptyHint: string;
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  locale: AppLocale;
  resultsAriaLabel: string;
  searching: string;
  onSelect: () => void;
}) {
  if (!query.trim()) {
    return (
      <div className="search-empty">
        <p>{emptyHint}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="search-empty">
        <p>{searching}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-empty">
        <p>{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-empty">
        <p>{locale === 'zh-CN' ? `没有找到“${query}”的相关结果。` : `No matches for “${query}”.`}</p>
      </div>
    );
  }

  return (
    <ul className="search-results" aria-label={resultsAriaLabel}>
      {results.map((result) => (
        <li key={result.slug} className="search-results__item">
          <Link href={`/posts/${result.slug}`} onClick={onSelect}>
            <div className="search-results__meta">
              <span>{new Date(result.date).toLocaleDateString(locale)}</span>
              {result.category ? <span>{result.category}</span> : null}
            </div>
            <h3>{result.title}</h3>
            <p>{result.summary || result.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
