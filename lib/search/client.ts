import Fuse from 'fuse.js';
import type { SearchDocument, SearchResult } from '@/lib/search/types';

let searchDocumentsPromise: Promise<SearchDocument[]> | null = null;
let fusePromise: Promise<Fuse<SearchDocument>> | null = null;

async function loadDocuments() {
  if (!searchDocumentsPromise) {
    searchDocumentsPromise = fetch('/search-index.json')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load search index: ${response.status}`);
        }
        return (await response.json()) as SearchDocument[];
      })
      .catch((error) => {
        searchDocumentsPromise = null;
        throw error;
      });
  }
  return searchDocumentsPromise;
}

async function loadFuse() {
  if (!fusePromise) {
    fusePromise = loadDocuments()
      .then(
        (documents) =>
          new Fuse(documents, {
            includeScore: true,
            threshold: 0.34,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
              { name: 'title', weight: 3 },
              { name: 'summary', weight: 2 },
              { name: 'description', weight: 1.5 },
              { name: 'tags', weight: 1.2 },
              { name: 'category', weight: 1 },
            ],
          })
      )
      .catch((error) => {
        fusePromise = null;
        throw error;
      });
  }
  return fusePromise;
}

export async function primeSearchIndex() {
  await loadFuse();
}

export async function searchDocuments(query: string): Promise<SearchResult[]> {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  const fuse = await loadFuse();
  return fuse
    .search(normalized)
    .map((entry) => ({ ...entry.item, score: entry.score }))
    .sort((left, right) => (left.score || 0) - (right.score || 0));
}
