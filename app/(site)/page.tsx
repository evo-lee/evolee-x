import type { Metadata } from 'next';
import Link from 'next/link';
import { PostCard } from '@/components/site/PostCard';
import { PostGrid } from '@/components/site/PostGrid';
import { SectionHeader } from '@/components/site/SectionHeader';
import { Ticker } from '@/components/site/Ticker';
import { CoverPlaceholder, pickCoverColor } from '@/components/site/CoverPlaceholder';
import { StructuredData } from '@/components/seo/StructuredData';
import { getRuntimePosts } from '@/lib/content/runtime';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildWebsiteStructuredData } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: siteConfig.title,
    description: siteConfig.description,
  });
}

const TICKER_ITEMS = [
  '正在阅读：AI 时代的元学习策略',
  '本月已发布 3 篇文章',
  '最新作品：EvoNote 进行中',
  '本周代码提交：12 次',
];

const PORTFOLIO_PLACEHOLDERS = [
  { id: 'evonote', title: 'EvoNote', status: '构建中' },
  { id: 'weather', title: '极简天气', status: '构建中' },
  { id: 'reads', title: '读书笔记站', status: '构建中' },
];

export default function HomePage() {
  const posts = getRuntimePosts();
  const featured = posts.find((post) => post.featured) ?? null;
  const rest = featured ? posts.filter((post) => post !== featured) : posts;

  return (
    <>
      <StructuredData data={buildWebsiteStructuredData()} />

      <main className="container">
        <section className="hero">
          <div className="hero__inner">
            <p className="eyebrow">中国 · 互联网</p>
            <h1 className="hero__title">
              一名独立开发者，
              <br />
              <em>在 AI 时代刻意进化。</em>
            </h1>
            <p className="hero__lede">
              AI 时代，是否要主动学习与进化完全掌握在自己手中。我会在这个博客记录自己的学习笔记、开发日志和思考。
            </p>
          </div>
        </section>

        <Ticker items={TICKER_ITEMS} />

        <section className="section">
          <SectionHeader
            num="01 · ARTICLES"
            title="文章"
            subtitle="记录，公开进行"
            linkLabel="全部 →"
            linkHref="/posts"
          />
          {featured ? (
            <div style={{ marginBottom: 32 }}>
              <PostCard post={featured} featured />
            </div>
          ) : null}
          {rest.length > 0 ? (
            <PostGrid posts={rest} searchable />
          ) : (
            <p className="empty">暂无文章</p>
          )}
        </section>

        <section className="section section--bordered">
          <SectionHeader
            num="02 · PORTFOLIO"
            title="作品"
            subtitle="正在构建中"
            linkLabel="全部 →"
            linkHref="/projects"
          />
          <div className="works-grid">
            {PORTFOLIO_PLACEHOLDERS.map((work) => (
              <Link key={work.id} href="/projects" className="work-card">
                <div className="work-card__cover" style={{ background: pickCoverColor(work.id) }}>
                  <CoverPlaceholder color={pickCoverColor(work.id)} label="project" />
                </div>
                <div className="work-card__body">
                  <p className="work-card__title">{work.title}</p>
                  <p className="work-card__status">{work.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
