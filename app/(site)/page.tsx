import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { PostList } from '@/components/site/PostList';
import { getRuntimePosts } from '@/lib/content/runtime';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildWebsiteStructuredData } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: '/',
    title: messages.pages.home.title,
    description: messages.pages.home.description,
  });
}

export default async function HomePage() {
  const locale = await detectRequestLocale();
  const posts = getRuntimePosts(locale);
  const featuredPosts = posts.filter((post) => post.featured);
  const homePosts =
    featuredPosts.length > 0
      ? [...featuredPosts, ...posts.filter((post) => !post.featured)].slice(0, 8)
      : posts.slice(0, 8);

  return (
    <>
      <StructuredData data={buildWebsiteStructuredData(locale)} />
      <section className="section">
        <PostList posts={homePosts} />
      </section>
    </>
  );
}
