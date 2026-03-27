import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RichContent } from '@/components/site/RichContent';
import { formatDate } from '@/lib/format';
import { getRuntimePostBySlug, getRuntimePosts } from '@/lib/content/runtime';

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

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.description,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="page-grid">
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
      <RichContent html={post.html} headings={post.headings} />
    </section>
  );
}
