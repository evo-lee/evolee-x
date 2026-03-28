import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { getRuntimeCategories, getRuntimePostsByCategory } from '@/lib/content/runtime';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  const categories = getRuntimeCategories();
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const { category } = await params;
  return buildPageMetadata({
    locale,
    path: `/categories/${category}`,
    title: messages.pages.category.metadataTitle(category),
    description: messages.pages.category.metadataDescription(category),
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const { category } = await params;
  const posts = getRuntimePostsByCategory(category, locale);
  const structuredData = buildCollectionPageStructuredData({
    locale,
    title: messages.pages.category.metadataTitle(category),
    description: messages.pages.category.metadataDescription(category),
    path: `/categories/${category}`,
  });

  return (
    <CollectionPage
      description={messages.pages.category.description}
      eyebrow={messages.pages.category.eyebrow}
      structuredData={structuredData}
      title={category}
    >
      <PostList posts={posts} emptyLabel={messages.pages.category.empty(category)} />
    </CollectionPage>
  );
}
