import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/article/ArticleBody';
import { ArticleToc } from '@/components/article/ArticleToc';
import { CopyCodeButtons } from '@/components/article/CopyCodeButtons';
import { CoverPlaceholder, pickCoverColor } from '@/components/site/CoverPlaceholder';
import { LocalizedLink } from '@/components/site/LocalizedLink';
import { StructuredData } from '@/components/seo/StructuredData';
import { formatDate, formatReadTime } from '@/lib/format';
import { getRuntimePostBySlug, getRuntimePosts } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { getRequestLocale } from '@/lib/i18n/server';
import { buildPostMetadata } from '@/lib/seo/metadata';
import {
  buildBlogPostingStructuredData,
  buildBreadcrumbStructuredData,
} from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return getRuntimePosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const locale = await getRequestLocale(searchParams);
  const messages = getLocaleMessages(locale);
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug, locale);
  if (!post) {
    return { title: messages.post.missingTitle };
  }
  return buildPostMetadata(post);
}

export default async function PostPage({ params, searchParams }: PageProps) {
  const locale = await getRequestLocale(searchParams);
  const messages = getLocaleMessages(locale);
  const { slug } = await params;
  const post = getRuntimePostBySlug(slug, locale);
  if (!post) notFound();

  const readTime = formatReadTime(post.text || post.excerpt || post.title);
  const cover = post.coverImage;
  const showPlaceholder = !cover?.src || cover.source === 'default';

  return (
    <>
      <StructuredData data={buildBlogPostingStructuredData(post)} />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: messages.post.homeCrumb, path: '/' },
          { name: messages.post.postsCrumb, path: '/posts' },
          { name: post.title, path: post.url },
        ])}
      />

      <main className="container--wide article-layout">
        <article>
          <LocalizedLink href="/posts" className="article-back">
            {messages.post.back}
          </LocalizedLink>

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
