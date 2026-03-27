import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
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

  return (
    <section className="page-grid">
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: `Category: ${category}`,
          description: `Posts filed under ${category}.`,
          path: `/categories/${category}`,
        })}
      />
      <header className="page-header">
        <p className="meta-note">Category</p>
        <h1>{category}</h1>
        <p>A quiet shelf for related entries.</p>
      </header>
      <PostList posts={posts} emptyLabel={`No posts in "${category}" yet.`} />
    </section>
  );
}
