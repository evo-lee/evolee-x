import type { Post } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function ArticleHeader({ post }: { post: Post }) {
  return (
    <header className="article-header">
      <p className="meta-note">Post</p>
      <h1>{post.title}</h1>
      <p>{post.description}</p>
      <ul className="page-meta" aria-label="Post metadata">
        <li>{formatDate(post.date)}</li>
        {post.category ? <li>{post.category}</li> : null}
        {post.tags.map((tag) => (
          <li key={tag}>#{tag}</li>
        ))}
      </ul>
    </header>
  );
}
