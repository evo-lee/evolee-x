import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticlePage } from '@/components/site/ArticlePage';
import { SiteLayout } from '@/components/site/SiteLayout';
import {
  getRuntimePostBySlug,
  getRuntimePostLocalesBySlug,
  getRuntimePostVariants,
  getRuntimeRelatedPosts,
} from '@/lib/content/runtime';
import type { AppLocale } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { localeHref, resolveRouteLocale } from '@/lib/i18n/route';
import { buildPostMetadata } from '@/lib/seo/metadata';
import {
  buildBlogPostingStructuredData,
  buildBreadcrumbStructuredData,
} from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function buildPostAlternates(slug: string): Partial<Record<AppLocale, string>> {
  return Object.fromEntries(
    getRuntimePostLocalesBySlug(slug).map((locale) => [locale, localeHref(locale, `/posts/${slug}`)])
  );
}

export function generateStaticParams() {
  return getRuntimePostVariants().map((post) => ({ locale: post.locale, slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveRouteLocale({ locale: localeParam });
  const messages = getLocaleMessages(locale);
  const post = getRuntimePostBySlug(slug, locale);

  if (!post) {
    return {
      title: messages.pages.post.notFoundTitle,
    };
  }

  return buildPostMetadata(post, buildPostAlternates(slug));
}

export default async function PostPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveRouteLocale({ locale: localeParam });
  const messages = getLocaleMessages(locale);
  const post = getRuntimePostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  return (
    <SiteLayout locale={locale}>
      <ArticlePage
        articleStructuredData={buildBlogPostingStructuredData(post)}
        breadcrumbStructuredData={buildBreadcrumbStructuredData(locale, [
          { name: messages.pages.post.homeCrumb, path: localeHref(locale, '/') },
          { name: messages.pages.post.postsCrumb, path: localeHref(locale, '/posts') },
          { name: post.title, path: post.url },
        ])}
        locale={locale}
        post={post}
        relatedPosts={getRuntimeRelatedPosts(post, locale, 3)}
      />
    </SiteLayout>
  );
}
