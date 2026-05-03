import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/article/ArticleBody';
import { StructuredData } from '@/components/seo/StructuredData';
import { getRuntimePageBySlug } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { getRequestLocale } from '@/lib/i18n/server';
import { buildPageContentMetadata } from '@/lib/seo/metadata';
import { buildPageStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = await getRequestLocale(searchParams);
  const messages = getLocaleMessages(locale);
  const page = getRuntimePageBySlug('about', locale);
  if (!page) return { title: messages.about.fallbackTitle };
  return buildPageContentMetadata(page);
}

export default async function AboutPage({ searchParams }: PageProps) {
  const locale = await getRequestLocale(searchParams);
  const page = getRuntimePageBySlug('about', locale);
  if (!page) notFound();

  return (
    <main className="container--narrow page-shell">
      <StructuredData data={buildPageStructuredData(page)} />
      <header className="page-header">
        <h1 className="page-header__title">{page.title}</h1>
      </header>
      <div className="about-avatar" aria-hidden="true">
        photo
      </div>
      <ArticleBody html={page.html} />
    </main>
  );
}
