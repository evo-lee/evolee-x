import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleContent } from '@/components/article/ArticleContent';
import { ContentPage } from '@/components/site/ContentPage';
import { SiteLayout } from '@/components/site/SiteLayout';
import { getRuntimePageBySlug } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { resolveRouteLocale } from '@/lib/i18n/route';
import { buildPageContentMetadata } from '@/lib/seo/metadata';
import { buildPageStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);
  const page = getRuntimePageBySlug('about', locale);

  if (!page) {
    return {
      title: messages.pages.about.fallbackTitle,
    };
  }

  return buildPageContentMetadata(page);
}

export default async function AboutPage({ params }: PageProps) {
  const locale = resolveRouteLocale(await params);
  const messages = getLocaleMessages(locale);
  const page = getRuntimePageBySlug('about', locale);

  if (!page) {
    notFound();
  }

  return (
    <SiteLayout locale={locale}>
      <ContentPage
        description={page.description}
        eyebrow={messages.pages.about.eyebrow}
        structuredData={buildPageStructuredData(page)}
        title={page.title}
      >
        <ArticleContent
          headings={page.headings}
          html={page.html}
          locale={locale}
          scope={`page-${page.slug}`}
        />
      </ContentPage>
    </SiteLayout>
  );
}
