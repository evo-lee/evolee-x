import { ArticleContent } from '@/components/article/ArticleContent';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/site/ContentPage';
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

  const structuredData = buildPageStructuredData(page);

  return (
    <ContentPage
      description={page.description}
      eyebrow="About"
      structuredData={structuredData}
      title={page.title}
    >
      <ArticleContent headings={page.headings} html={page.html} scope={`page-${page.slug}`} />
    </ContentPage>
  );
}
