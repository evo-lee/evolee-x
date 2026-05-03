import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/article/ArticleBody';
import { ArticleToc } from '@/components/article/ArticleToc';
import { CopyCodeButtons } from '@/components/article/CopyCodeButtons';
import { CoverPlaceholder, pickCoverColor } from '@/components/site/CoverPlaceholder';
import { StructuredData } from '@/components/seo/StructuredData';
import { formatDate, formatReadTime } from '@/lib/format';
import {
  getRuntimePostBySlug,
  getRuntimePosts,
} from '@/lib/content/runtime';
import { buildPostMetadata } from '@/lib/seo/metadata';
import {
  buildBlogPostingStructuredData,
  buildBreadcrumbStructuredData,
} from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getRuntimePosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug);
  if (!post) {
    return { title: '文章不存在' };
  }
  return buildPostMetadata(post);
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug);
  if (!post) notFound();

  const readTime = formatReadTime(post.text || post.excerpt || post.title);
  const cover = post.coverImage;
  const showPlaceholder = !cover?.src || cover.source === 'default';

  return (
    <>
      <StructuredData data={buildBlogPostingStructuredData(post)} />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: '首页', path: '/' },
          { name: '文章', path: '/posts' },
          { name: post.title, path: post.url },
        ])}
      />

      <main className="container--wide article-layout">
        <article>
          <Link href="/posts" className="article-back">
            ← 返回文章列表
          </Link>

          <div className="article-cover">
            {showPlaceholder ? (
              <CoverPlaceholder color={pickCoverColor(post.slug)} label="cover" />
            ) : (
              <img
                src={cover.src}
                alt={cover.alt || post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          <header className="article-header">
            {post.tags.length > 0 && (
              <div className="article-header__tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="article-header__title">{post.title}</h1>
            <div className="article-header__meta">
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{readTime}</span>
              {post.author ? (
                <>
                  <span>·</span>
                  <span>{post.author}</span>
                </>
              ) : null}
            </div>
          </header>

          {post.description ? <p className="article-lede">{post.description}</p> : null}

          <ArticleBody html={post.html} />
          <CopyCodeButtons />
        </article>

        <ArticleToc
          headings={post.headings.filter((heading) => heading.level <= 3)}
          meta={`${formatDate(post.date)} · ${readTime}`}
        />
      </main>
    </>
  );
}
