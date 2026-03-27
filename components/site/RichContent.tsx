import Link from 'next/link';
import type { Heading } from '@/lib/content/types';

export function RichContent({
  html,
  headings,
}: {
  html: string;
  headings: Heading[];
}) {
  return (
    <div className="article-layout">
      <article className="prose-panel">
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      {headings.length > 1 ? (
        <aside className="toc" aria-label="Table of contents">
          <p className="toc__title">On this page</p>
          <ol className="toc__list">
            {headings
              .filter((heading) => heading.level <= 3)
              .map((heading) => (
                <li key={heading.id} data-level={heading.level}>
                  <Link href={`#${heading.id}`}>{heading.text}</Link>
                </li>
              ))}
          </ol>
        </aside>
      ) : null}
    </div>
  );
}
