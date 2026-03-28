import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticlePage } from '@/components/site/ArticlePage';
import { getRuntimePostBySlug, getRuntimePosts, getRuntimeRelatedPosts } from '@/lib/content/runtime';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { buildPostMetadata } from '@/lib/seo/metadata';
import { buildBlogPostingStructuredData, buildBreadcrumbStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getRuntimePosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug, locale);

  if (!post) {
    return {
      title: messages.pages.post.notFoundTitle,
    };
  }

  return buildPostMetadata(post);
}

export default async function PostPage({ params }: PageProps) {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const articleStructuredData = buildBlogPostingStructuredData(post);
  const relatedPosts = getRuntimeRelatedPosts(post, locale, 3);
  const breadcrumbStructuredData = buildBreadcrumbStructuredData(locale, [
    { name: messages.pages.post.homeCrumb, path: '/' },
    { name: messages.pages.post.postsCrumb, path: '/posts' },
    { name: post.title, path: post.url },
  ]);

  return (
    <ArticlePage
      articleStructuredData={articleStructuredData}
      breadcrumbStructuredData={breadcrumbStructuredData}
      post={post}
      relatedPosts={relatedPosts}
    />
  );
}
