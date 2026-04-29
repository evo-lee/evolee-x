import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { PostList } from '@/components/site/PostList';
import { SiteLayout } from '@/components/site/SiteLayout';
import { APP_LOCALES } from '@/lib/i18n/config';
import { getRuntimePosts } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { resolveRouteLocale } from '@/lib/i18n/route';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildWebsiteStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return APP_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);

  return buildPageMetadata({
    locale,
    path: '/',
    title: messages.pages.home.title,
    description: messages.pages.home.description,
  });
}

export default async function HomePage({ params }: PageProps) {
  const locale = resolveRouteLocale(await params);
  const posts = getRuntimePosts(locale);
  const featuredPosts = posts.filter((post) => post.featured);
  const homePosts =
    featuredPosts.length > 0
      ? [...featuredPosts, ...posts.filter((post) => !post.featured)].slice(0, 8)
      : posts.slice(0, 8);

  return (
    <SiteLayout locale={locale}>
      <StructuredData data={buildWebsiteStructuredData(locale)} />
      <section className="section">
        <PostList posts={homePosts} locale={locale} />
      </section>
    </SiteLayout>
  );
}
