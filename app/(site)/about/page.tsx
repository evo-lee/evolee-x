import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StructuredData } from '@/components/seo/StructuredData';
import { RichContent } from '@/components/site/RichContent';
import { getRuntimePageBySlug } from '@/lib/content/runtime';
import { buildPageContentMetadata } from '@/lib/seo/metadata';
import { buildPageStructuredData } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const page = getRuntimePageBySlug('about');

  if (!page) {
    return {
      title: 'About',
    };
  }

  return buildPageContentMetadata(page);
}

export default async function AboutPage() {
  const page = getRuntimePageBySlug('about');

  if (!page) {
    notFound();
  }

  return (
    <section className="page-grid">
      <StructuredData data={buildPageStructuredData(page)} />
      <header className="page-header">
        <p className="meta-note">About</p>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </header>
      <RichContent html={page.html} headings={page.headings} />
    </section>
  );
}
