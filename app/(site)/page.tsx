import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { HomeHero } from '@/components/site/HomeHero';
import { PostList } from '@/components/site/PostList';
import { SectionIntro } from '@/components/site/SectionIntro';
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
      <HomeHero categories={categories} tags={tags} />

      {featuredPosts.length > 0 ? (
        <section className="section">
          <SectionIntro eyebrow="Featured" title="Highlighted writing" />
          <PostList posts={featuredPosts} />
        </section>
      ) : null}

      <section className="section">
        <SectionIntro eyebrow="Recent" title="Latest entries" />
        <PostList posts={recentPosts} emptyLabel="No published posts yet." />
      </section>
    </>
  );
}
