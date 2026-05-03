import type { Metadata } from 'next';
import { PostCard } from '@/components/site/PostCard';
import { PostGrid } from '@/components/site/PostGrid';
import { SectionHeader } from '@/components/site/SectionHeader';
import { Ticker } from '@/components/site/Ticker';
import { CoverPlaceholder, pickCoverColor } from '@/components/site/CoverPlaceholder';
import { LocalizedLink } from '@/components/site/LocalizedLink';
import { StructuredData } from '@/components/seo/StructuredData';
import { getRuntimePosts } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { getRequestLocale } from '@/lib/i18n/server';
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

const PORTFOLIO_PLACEHOLDERS = [
  { id: 'evonote', title: 'EvoNote', status: '构建中' },
  { id: 'weather', title: '极简天气', status: '构建中' },
  { id: 'reads', title: '读书笔记站', status: '构建中' },
];

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const locale = await getRequestLocale(searchParams);
  const messages = getLocaleMessages(locale);
  const posts = getRuntimePosts(locale);
  const featured = posts.find((post) => post.featured) ?? null;
  const rest = featured ? posts.filter((post) => post !== featured) : posts;

  return (
    <>
      <StructuredData data={buildWebsiteStructuredData()} />

      <main className="container">
        <section className="hero">
          <div className="hero__inner">
            <p className="eyebrow">{messages.home.eyebrow}</p>
            <h1 className="hero__title">
              {messages.home.titleTop}
              <br />
              <em>{messages.home.titleEm}</em>
            </h1>
            <p className="hero__lede">{messages.home.lede}</p>
          </div>
        </section>

        <Ticker items={messages.home.ticker} />

        <section className="section">
          <SectionHeader
            num="01 · ARTICLES"
            title={messages.home.articlesTitle}
            subtitle={messages.home.articlesSubtitle}
            linkLabel={messages.home.all}
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
            <p className="empty">{messages.home.emptyPosts}</p>
          )}
        </section>

        <section className="section section--bordered">
          <SectionHeader
            num="02 · PORTFOLIO"
            title={messages.home.projectsTitle}
            subtitle={messages.home.projectsSubtitle}
            linkLabel={messages.home.all}
            linkHref="/projects"
          />
          <div className="works-grid">
            {PORTFOLIO_PLACEHOLDERS.map((work) => (
              <LocalizedLink key={work.id} href="/projects" className="work-card">
                <div className="work-card__cover" style={{ background: pickCoverColor(work.id) }}>
                  <CoverPlaceholder color={pickCoverColor(work.id)} label="project" />
                </div>
                <div className="work-card__body">
                  <p className="work-card__title">{work.title}</p>
                  <p className="work-card__status">{messages.home.projectStatus}</p>
                </div>
              </LocalizedLink>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
