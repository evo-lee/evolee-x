import type { Metadata } from 'next';
import { CollectionPage } from '@/components/site/CollectionPage';
import { PostList } from '@/components/site/PostList';
import { getRuntimePostsByTag, getRuntimeTags } from '@/lib/content/runtime';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
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
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const { tag } = await params;
  return buildPageMetadata({
    locale,
    path: `/tags/${tag}`,
    title: messages.pages.tag.metadataTitle(tag),
    description: messages.pages.tag.metadataDescription(tag),
  });
}

export default async function TagPage({ params }: PageProps) {
  const locale = await detectRequestLocale();
  const messages = getLocaleMessages(locale);
  const { tag } = await params;
  const posts = getRuntimePostsByTag(tag, locale);
  const structuredData = buildCollectionPageStructuredData({
    locale,
    title: messages.pages.tag.metadataTitle(tag),
    description: messages.pages.tag.metadataDescription(tag),
    path: `/tags/${tag}`,
  });

  return (
    <CollectionPage
      description={messages.pages.tag.description}
      eyebrow={messages.pages.tag.eyebrow}
      structuredData={structuredData}
      title={`#${tag}`}
    >
      <PostList posts={posts} emptyLabel={messages.pages.tag.empty(tag)} />
    </CollectionPage>
  );
}
