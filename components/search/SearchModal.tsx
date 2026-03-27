'use client';

import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SearchResults } from '@/components/search/SearchResults';
import { trackEvent } from '@/lib/analytics/track';
import { primeSearchIndex, searchDocuments } from '@/lib/search/client';
import type { SearchResult } from '@/lib/search/types';

const OPEN_EVENT = 'site-search:open';

function isModifierShortcut(event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
}

export function SearchModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    function openModal(source: 'trigger' | 'shortcut') {
      setOpen(true);
      setError(null);
      trackEvent('open_search', { source, path: pathname });
      void primeSearchIndex().catch(() => {
        setError('Search index is unavailable right now.');
      });
    }

    function handleShortcut(event: KeyboardEvent) {
      if (isModifierShortcut(event)) {
        event.preventDefault();
        openModal('shortcut');
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    function handleOpenEvent() {
      openModal('trigger');
    }

    window.addEventListener('keydown', handleShortcut);
    window.addEventListener(OPEN_EVENT, handleOpenEvent);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
      window.removeEventListener(OPEN_EVENT, handleOpenEvent);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timeout = window.setTimeout(() => {
      startTransition(() => {
        void searchDocuments(normalizedQuery)
          .then((nextResults) => {
            setResults(nextResults);
            setLoading(false);
          })
          .catch(() => {
            setError('Search failed to load. Try again.');
            setLoading(false);
          });
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [normalizedQuery, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="search-modal"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div
        ref={dialogRef}
        className="search-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search posts"
      >
        <div className="search-modal__header">
          <p className="search-modal__eyebrow">Search</p>
          <button
            type="button"
            className="control-button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
          >
            Esc
          </button>
        </div>
        <input
          ref={inputRef}
          className="search-modal__input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, summaries, tags, categories…"
        />
        <SearchResults
          error={error}
          loading={loading}
          query={query}
          results={results}
          onSelect={() => setOpen(false)}
        />
      </div>
    </div>
  );
}

export function openSearchModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}
