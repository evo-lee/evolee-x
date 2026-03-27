import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticlePage } from '@/components/site/ArticlePage';
import { getRuntimePostBySlug, getRuntimePosts } from '@/lib/content/runtime';
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
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  return buildPostMetadata(post);
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleStructuredData = buildBlogPostingStructuredData(post);
  const breadcrumbStructuredData = buildBreadcrumbStructuredData([
    { name: 'Home', path: '/' },
    { name: 'Posts', path: '/posts' },
    { name: post.title, path: post.url },
  ]);

  return (
    <ArticlePage
      articleStructuredData={articleStructuredData}
      breadcrumbStructuredData={breadcrumbStructuredData}
      post={post}
    />
  );
}
