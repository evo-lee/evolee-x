import Link from 'next/link';
import { detectRequestLocale } from '@/lib/i18n/detect';
import type { PostSummary } from '@/lib/content/types';
import { formatDate, formatMonth } from '@/lib/format';

type ArchiveGroup = {
  key: string;
  items: PostSummary[];
};

export async function ArchiveList({ groups }: { groups: ArchiveGroup[] }) {
  const locale = await detectRequestLocale();

  return (
    <div className="section">
      {groups.map((group) => (
        <section key={group.key} className="archive-group">
          <h2>{formatMonth(group.items[0].date, locale)}</h2>
          <ul className="post-list">
            {group.items.map((post) => (
              <li key={post.slug} className="post-list__item">
                <div className="post-list__meta">
                  <time dateTime={post.date.toISOString()}>{formatDate(post.date, locale)}</time>
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
  );
}
