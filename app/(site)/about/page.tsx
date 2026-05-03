import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/article/ArticleBody';
import { StructuredData } from '@/components/seo/StructuredData';
import { getRuntimePageBySlug } from '@/lib/content/runtime';
import { buildPageContentMetadata } from '@/lib/seo/metadata';
import { buildPageStructuredData } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const page = getRuntimePageBySlug('about');
  if (!page) return { title: '关于我' };
  return buildPageContentMetadata(page);
}

export default function AboutPage() {
  const page = getRuntimePageBySlug('about');
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
