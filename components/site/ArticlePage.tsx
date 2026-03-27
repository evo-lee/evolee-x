import { StructuredData } from '@/components/seo/StructuredData';
import { ArticleHeader } from '@/components/site/ArticleHeader';
import { RichContent } from '@/components/site/RichContent';
import { CoverImage } from '@/components/ui/CoverImage';
import type { Post } from '@/lib/content/types';

export function ArticlePage({
  post,
  articleStructuredData,
  breadcrumbStructuredData,
}: {
  post: Post;
  articleStructuredData: object;
  breadcrumbStructuredData: object;
}) {
  return (
    <section className="page-grid">
      <StructuredData data={articleStructuredData} />
      <StructuredData data={breadcrumbStructuredData} />
      <ArticleHeader post={post} />
      <CoverImage alt={post.coverImage.alt} priority src={post.coverImage.src} />
      <RichContent html={post.html} headings={post.headings} />
    </section>
  );
}
