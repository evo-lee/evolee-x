import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/seo/StructuredData';
import { RichContent } from '@/components/site/RichContent';
import { CoverImage } from '@/components/ui/CoverImage';
import { formatDate } from '@/lib/format';
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

  return (
    <section className="page-grid">
      <StructuredData data={buildBlogPostingStructuredData(post)} />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Posts', path: '/posts' },
          { name: post.title, path: post.url },
        ])}
      />
      <header className="article-header">
        <p className="meta-note">Post</p>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <ul className="page-meta" aria-label="Post metadata">
          <li>{formatDate(post.date)}</li>
          {post.category ? <li>{post.category}</li> : null}
          {post.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      </header>
      <CoverImage alt={post.coverImage.alt} priority src={post.coverImage.src} />
      <RichContent html={post.html} headings={post.headings} />
    </section>
  );
}
