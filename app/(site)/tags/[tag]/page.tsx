import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { getRuntimePostsByTag, getRuntimeTags } from '@/lib/content/runtime';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

type PageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const tags = getRuntimeTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return buildPageMetadata({
    path: `/tags/${tag}`,
    title: `Tag: ${tag}`,
    description: `Posts tagged with ${tag}.`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getRuntimePostsByTag(tag);
  const structuredData = buildCollectionPageStructuredData({
    title: `Tag: ${tag}`,
    description: `Posts tagged with ${tag}.`,
    path: `/tags/${tag}`,
  });

  return (
    <CollectionPage
      description="Posts collected under a shared topic."
      eyebrow="Tag"
      structuredData={structuredData}
      title={`#${tag}`}
    >
      <PostList posts={posts} emptyLabel={`No posts tagged with "${tag}" yet.`} />
    </CollectionPage>
  );
}
