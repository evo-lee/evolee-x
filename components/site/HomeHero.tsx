import Link from 'next/link';
import type { AppLocale } from '@/lib/i18n/config';
import { localeHref } from '@/lib/i18n/route';
import { TaxonomyChipList } from '@/components/site/TaxonomyChipList';

export function HomeHero({
  categories,
  tags,
  locale = 'zh-CN',
}: {
  categories: string[];
  tags: string[];
  locale?: AppLocale;
}) {
  const shortcutItems = [
    ...categories.slice(0, 4).map((category) => ({
      href: localeHref(locale, `/categories/${encodeURIComponent(category)}`),
      label: category,
    })),
    ...tags.slice(0, 4).map((tag) => ({
      href: localeHref(locale, `/tags/${encodeURIComponent(tag)}`),
      label: `#${tag}`,
    })),
  ];

  const isChinese = locale === 'zh-CN';

  return (
    <section className="hero">
      <p className="garden-eyebrow">· 花园笔记 · evolee&rsquo;s work ·</p>
      {isChinese ? (
        <>
          <h1 className="hero__title">博客是一座<br /><em style={{ fontStyle: 'italic', color: 'var(--bloom)' }}>小花园。</em></h1>
          <p className="hero__description">
            每一篇文字都是一株植物——有些是常青，有些是季候花，有些只活了一周就枯了。我把它们都种在这里。
          </p>
          <div className="hero__links">
            <Link href={localeHref(locale, '/posts')}>走进花园 →</Link>
            <Link href={localeHref(locale, '/archives')}>时间的年轮</Link>
            <Link href={localeHref(locale, '/about')}>关于这个花园</Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="hero__title">A blog as a <em style={{ fontStyle: 'italic', color: 'var(--bloom)' }}>small garden.</em></h1>
          <p className="hero__description">
            Every post is a plant — some evergreen, some seasonal, some that only lived a week. All of them planted here.
          </p>
          <div className="hero__links">
            <Link href={localeHref(locale, '/posts')}>Walk the garden →</Link>
            <Link href={localeHref(locale, '/archives')}>Time&rsquo;s rings</Link>
            <Link href={localeHref(locale, '/about')}>About this garden</Link>
          </div>
        </>
      )}
      <TaxonomyChipList ariaLabel="Homepage taxonomy shortcuts" items={shortcutItems} />
    </section>
  );
}
