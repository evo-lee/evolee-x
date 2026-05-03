'use client';

import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import type { PostSummary } from '@/lib/content/types';
import { PostCard } from './PostCard';
import { SearchBar } from './SearchBar';

export function PostGrid({
  posts,
  searchable = true,
  emptyLabel = '没有找到匹配的文章',
}: {
  posts: PostSummary[];
  searchable?: boolean;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'excerpt', weight: 2 },
          { name: 'description', weight: 1.5 },
          { name: 'tags', weight: 1.2 },
          { name: 'category', weight: 1 },
        ],
        threshold: 0.34,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [posts]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return posts;
    return fuse.search(q).map((entry) => entry.item);
  }, [fuse, posts, query]);

  return (
    <>
      {searchable ? <SearchBar value={query} onChange={setQuery} /> : null}
      {filtered.length === 0 ? (
        <p className="empty">{emptyLabel}</p>
      ) : (
        <div className="posts-grid">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
