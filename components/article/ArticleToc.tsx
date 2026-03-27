'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/content/types';

export function ArticleToc({ headings }: { headings: Heading[] }) {
  const tocHeadings = headings.filter((heading) => heading.level <= 3);
  const [activeId, setActiveId] = useState<string | null>(tocHeadings[0]?.id ?? null);

  useEffect(() => {
    if (tocHeadings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.1, 0.5, 1],
      }
    );

    tocHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocHeadings]);

  if (tocHeadings.length <= 1) {
    return null;
  }

  return (
    <aside className="toc" aria-label="Table of contents" data-no-typography="true">
      <p className="toc__title">On this page</p>
      <ol className="toc__list">
        {tocHeadings.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <Link
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? 'location' : undefined}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
