import { ArticleContent } from '@/components/article/ArticleContent';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/site/ContentPage';
import { getRuntimePageBySlug } from '@/lib/content/runtime';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { buildPageContentMetadata } from '@/lib/seo/metadata';
import { buildPageStructuredData } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const page = getRuntimePageBySlug('about', locale);

  if (!page) {
    return {
      title: messages.pages.about.fallbackTitle,
    };
  }

  return buildPageContentMetadata(page);
}

export default async function AboutPage() {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const page = getRuntimePageBySlug('about', locale);

  if (!page) {
    notFound();
  }

  const structuredData = buildPageStructuredData(page);

  return (
    <ContentPage
      description={page.description}
      eyebrow={messages.pages.about.eyebrow}
      structuredData={structuredData}
      title={page.title}
    >
      <ArticleContent headings={page.headings} html={page.html} scope={`page-${page.slug}`} />
    </ContentPage>
  );
}
