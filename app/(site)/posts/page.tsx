import type { Metadata } from 'next';
import { PostGrid } from '@/components/site/PostGrid';
import { StructuredData } from '@/components/seo/StructuredData';
import { getRuntimePosts } from '@/lib/content/runtime';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { getRequestLocale } from '@/lib/i18n/server';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildCollectionPageStructuredData } from '@/lib/seo/structured-data';

const TITLE = '全部文章';
const DESCRIPTION = '所有公开发表的文章列表，可按关键词搜索。';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/posts', title: TITLE, description: DESCRIPTION });
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PostsPage({ searchParams }: PageProps) {
  const locale = await getRequestLocale(searchParams);
  const messages = getLocaleMessages(locale);
  const posts = getRuntimePosts(locale);

  return (
    <main className="container page-shell">
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: TITLE,
          description: DESCRIPTION,
          path: '/posts',
        })}
      />
      <header className="page-header">
        <h1 className="page-header__title">{messages.posts.title}</h1>
        <p className="page-header__sub">{messages.posts.count(posts.length)}</p>
      </header>
      <PostGrid posts={posts} searchable />
    </main>
  );
}
