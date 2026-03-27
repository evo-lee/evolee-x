import { StructuredData } from '@/components/seo/StructuredData';
import { ArticleContent } from '@/components/article/ArticleContent';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { RelatedPosts } from '@/components/article/RelatedPosts';
import { CoverImage } from '@/components/ui/CoverImage';
import type { Post, PostSummary } from '@/lib/content/types';

export function ArticlePage({
  post,
  articleStructuredData,
  breadcrumbStructuredData,
  relatedPosts = [],
}: {
  post: Post;
  articleStructuredData: object;
  breadcrumbStructuredData: object;
  relatedPosts?: PostSummary[];
}) {
  return (
    <section className="page-grid">
      <StructuredData data={articleStructuredData} />
      <StructuredData data={breadcrumbStructuredData} />
      <ArticleHeader post={post} />
      <CoverImage alt={post.coverImage.alt} priority src={post.coverImage.src} />
      <ArticleContent headings={post.headings} html={post.html} scope={`post-${post.slug}`} />
      <RelatedPosts posts={relatedPosts} />
    </section>
  );
}
