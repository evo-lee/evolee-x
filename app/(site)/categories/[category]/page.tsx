import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { getRuntimeCategories, getRuntimePostsByCategory } from '@/lib/content/runtime';
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
  const { category } = await params;
  return buildPageMetadata({
    path: `/categories/${category}`,
    title: `Category: ${category}`,
    description: `Posts filed under ${category}.`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const posts = getRuntimePostsByCategory(category);
  const structuredData = buildCollectionPageStructuredData({
    title: `Category: ${category}`,
    description: `Posts filed under ${category}.`,
    path: `/categories/${category}`,
  });

  return (
    <CollectionPage
      description="A quiet shelf for related entries."
      eyebrow="Category"
      structuredData={structuredData}
      title={category}
    >
      <PostList posts={posts} emptyLabel={`No posts in "${category}" yet.`} />
    </CollectionPage>
  );
}
