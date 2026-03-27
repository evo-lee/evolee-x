import Link from 'next/link';
import type { SearchResult } from '@/lib/search/types';

export function SearchResults({
  query,
  results,
  loading,
  error,
  onSelect,
}: {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  onSelect: () => void;
}) {
  if (!query.trim()) {
    return (
      <div className="search-empty">
        <p>Type a title, tag, category, or phrase from a summary.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="search-empty">
        <p>Searching…</p>
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
        <p>No matches for “{query}”.</p>
      </div>
    );
  }

  return (
    <ul className="search-results" aria-label="Search results">
      {results.map((result) => (
        <li key={result.slug} className="search-results__item">
          <Link href={`/posts/${result.slug}`} onClick={onSelect}>
            <div className="search-results__meta">
              <span>{new Date(result.date).toLocaleDateString('en-CA')}</span>
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
