# Search System

English | [简体中文](./search-system.zh-CN.md)

## Scope

This document explains how on-site search works from build-time indexing to client-side querying.

## Main Files

- `scripts/content/build-search-index.ts`
- `lib/search/types.ts`
- `lib/search/client.ts`
- `components/search/SearchModal.tsx`
- `components/search/SearchResults.tsx`
- `components/ui/SearchTrigger.tsx`

## Design Goals

- no remote search service dependency
- no client-side full-content preload until search is used
- fast fuzzy search with weighted fields
- keyboard-first interaction

## Flow

1. `scripts/content/build-search-index.ts` generates `public/search-index.json`.
2. The app loads normally without fetching the search index.
3. `SearchTrigger` or keyboard shortcuts open the modal.
4. `primeSearchIndex()` or `searchDocuments(query)` fetches the JSON on demand.
5. Fuse.js runs weighted fuzzy matching in the browser.
6. `SearchResults` renders matched posts and pages.

## Key Functions

### `primeSearchIndex()`

- Purpose:
  warm the cached Fuse.js instance before a user submits a query
- Behavior:
  lazily loads the search index and resets internal cache on failure

### `searchDocuments(query)`

- Purpose:
  run fuzzy search against the generated document list
- Behavior:
  trims the query, returns an empty array for blank input, and searches weighted keys including title, summary, description, tags, and category

## Search Index Contract

The generated search index is a static JSON file. It allows the UI to search without talking to a third-party service or database.

## Failure Model

- If `/search-index.json` cannot be fetched, search fails for that session request.
- Internal promise caches are reset on load failure so retries remain possible.
- Search is optional and does not affect initial page render.

## Example

```ts
import { searchDocuments } from '@/lib/search/client';

const results = await searchDocuments('cloudflare workers');
console.log(results.map((item) => item.title));
```
