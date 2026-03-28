import Link from 'next/link';
import { TaxonomyChipList } from '@/components/site/TaxonomyChipList';

export function HomeHero({
  categories,
  tags,
}: {
  categories: string[];
  tags: string[];
}) {
  const shortcutItems = [
    ...categories.slice(0, 4).map((category) => ({
      href: `/categories/${category}`,
      label: category,
    })),
    ...tags.slice(0, 4).map((tag) => ({
      href: `/tags/${tag}`,
      label: `#${tag}`,
    })),
  ];

  return (
    <section className="hero">
      <p className="hero__eyebrow">Personal blog</p>
      <h1 className="hero__title">Programming, reading, and quiet notes from an ongoing life.</h1>
      <p className="hero__description">
        A small archive of code, books, and lived observations. The structure stays minimal so the
        writing can carry the weight.
      </p>
      <div className="hero__links">
        <Link href="/posts">Browse all posts</Link>
        <Link href="/archives">Open archives</Link>
        <Link href="/about">Read about this blog</Link>
      </div>
      <TaxonomyChipList ariaLabel="Homepage taxonomy shortcuts" items={shortcutItems} />
    </section>
  );
}
