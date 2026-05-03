'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from '@/lib/content/types';

export function ArticleToc({ headings, meta }: { headings: Heading[]; meta?: string }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-90px 0px -55% 0px', threshold: [0, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="article-toc">
      <p className="article-toc__title">目录</p>
      <nav className="article-toc__nav">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className="article-toc__link"
            data-active={active === heading.id || undefined}
            data-level={heading.level}
          >
            {heading.text}
          </a>
        ))}
      </nav>
      {meta ? <div className="article-toc__meta">{meta}</div> : null}
    </aside>
  );
}
