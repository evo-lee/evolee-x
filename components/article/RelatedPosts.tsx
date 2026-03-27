import Link from 'next/link';
import type { PostSummary } from '@/lib/content/types';
import { formatDate } from '@/lib/format';

export function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="section related-posts">
      <div className="section-intro">
        <p className="section-intro__eyebrow">Related</p>
        <h2>Continue reading</h2>
      </div>
      <ul className="related-posts__list">
        {posts.map((post) => (
          <li key={post.slug} className="related-posts__item">
            <p className="related-posts__meta">{formatDate(post.date)}</p>
            <h3>
              <Link href={post.url}>{post.title}</Link>
            </h3>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
