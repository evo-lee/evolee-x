import type { Metadata } from 'next';
import Link from 'next/link';
import { getRuntimeArchives } from '@/lib/content/runtime';
import { formatDate, formatMonth } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Archives',
  description: 'Browse posts by month.',
};

export default async function ArchivesPage() {
  const groups = getRuntimeArchives();

  return (
    <section className="page-grid">
      <header className="page-header">
        <p className="meta-note">Archives</p>
        <h1>Monthly index</h1>
        <p>A chronological shelf of published writing.</p>
      </header>
      <div className="section">
        {groups.map((group) => (
          <section key={group.key} className="archive-group">
            <h2>{formatMonth(group.items[0].date)}</h2>
            <ul className="post-list">
              {group.items.map((post) => (
                <li key={post.slug} className="post-list__item">
                  <div className="post-list__meta">
                    <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
                  </div>
                  <div className="post-list__body">
                    <h2>
                      <Link href={post.url}>{post.title}</Link>
                    </h2>
                    <p>{post.excerpt}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
