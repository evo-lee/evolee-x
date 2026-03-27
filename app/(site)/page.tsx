import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import { PostList } from '@/components/site/PostList';
import { getRuntimeCategories, getRuntimePosts, getRuntimeTags } from '@/lib/content/runtime';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildWebsiteStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = buildPageMetadata({
  path: '/',
  title: 'Home',
  description: 'Programming notes, reading reflections, and personal essays.',
});

export default async function HomePage() {
  const posts = getRuntimePosts();
  const featuredPosts = posts.filter((post) => post.featured);
  const recentPosts = posts.slice(0, 8);
  const tags = getRuntimeTags();
  const categories = getRuntimeCategories();

  return (
    <>
      <StructuredData data={buildWebsiteStructuredData()} />
      <section className="hero">
        <p className="hero__eyebrow">Personal blog</p>
        <h1>Programming, reading, and quiet notes from an ongoing life.</h1>
        <p>
          A small archive of code, books, and lived observations. The structure stays minimal so the
          writing can carry the weight.
        </p>
        <div className="hero__links">
          <Link href="/posts">Browse all posts</Link>
          <Link href="/archives">Open archives</Link>
          <Link href="/about">Read about this blog</Link>
        </div>
        <ul className="simple-list" aria-label="Homepage taxonomy shortcuts">
          {categories.slice(0, 4).map((category) => (
            <li key={category}>
              <Link className="chip-link" href={`/categories/${category}`}>
                {category}
              </Link>
            </li>
          ))}
          {tags.slice(0, 4).map((tag) => (
            <li key={tag}>
              <Link className="chip-link" href={`/tags/${tag}`}>
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {featuredPosts.length > 0 ? (
        <section className="section">
          <div className="section-intro">
            <p className="section-intro__eyebrow">Featured</p>
            <h2>Highlighted writing</h2>
          </div>
          <PostList posts={featuredPosts} />
        </section>
      ) : null}

      <section className="section">
        <div className="section-intro">
          <p className="section-intro__eyebrow">Recent</p>
          <h2>Latest entries</h2>
        </div>
        <PostList posts={recentPosts} emptyLabel="No published posts yet." />
      </section>
    </>
  );
}
