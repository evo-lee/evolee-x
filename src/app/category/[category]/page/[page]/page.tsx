import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleList } from "@/components/article-list";
import { CategoryNav } from "@/components/category-nav";
import { PaginationNav } from "@/components/pagination-nav";
import {
  getCategoryName,
  getPostListing,
  isKnownCategory,
} from "@/lib/content/listings";
import { siteConfig } from "@/lib/site-config";

interface CategoryPagedPageProps {
  params: Promise<{ category: string; page: string }>;
}

function normalizeCategory(category: string): string {
  return decodeURIComponent(category).trim().toLowerCase();
}

function parsePageSegment(page: string): number | null {
  if (!/^\d+$/.test(page)) {
    return null;
  }
  const parsed = Number(page);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }
  return Math.trunc(parsed);
}

function categoryPageUrl(category: string, page: number): string {
  if (page <= 1) {
    return `/category/${encodeURIComponent(category)}`;
  }

  return `/category/${encodeURIComponent(category)}/page/${page}`;
}

export async function generateMetadata({
  params,
}: CategoryPagedPageProps): Promise<Metadata> {
  const { category, page } = await params;
  const normalizedCategory = normalizeCategory(category);
  const parsedPage = parsePageSegment(page);

  if (!isKnownCategory(normalizedCategory) || parsedPage === null) {
    return {
      title: "分类分页不存在",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryName = getCategoryName(normalizedCategory);
  const canonicalPath = categoryPageUrl(normalizedCategory, parsedPage);

  return {
    title: `${categoryName} 分类第 ${parsedPage} 页`,
    description: `${siteConfig.title}中关于${categoryName}的第 ${parsedPage} 页文章列表。`,
    alternates: {
      canonical: `${siteConfig.siteUrl}${canonicalPath}`,
    },
  };
}

export default async function CategoryPagedPage({ params }: CategoryPagedPageProps) {
  const { category, page } = await params;
  const normalizedCategory = normalizeCategory(category);
  const parsedPage = parsePageSegment(page);

  if (!isKnownCategory(normalizedCategory) || parsedPage === null) {
    notFound();
  }

  if (category !== normalizedCategory) {
    redirect(categoryPageUrl(normalizedCategory, parsedPage));
  }

  if (parsedPage <= 1) {
    redirect(categoryPageUrl(normalizedCategory, 1));
  }

  const listing = await getPostListing({
    category: normalizedCategory,
    pageParam: String(parsedPage),
  });

  if (parsedPage > listing.pageTotal) {
    notFound();
  }

  return (
    <main className="pb-8 pt-2">
      <CategoryNav currentCategory={normalizedCategory} />
      <ArticleList
        posts={listing.visiblePosts}
        hitsMap={listing.hitsMap}
        hitsLoading={listing.hitsLoading}
      />
      <PaginationNav
        category={normalizedCategory}
        page={listing.page}
        pageTotal={listing.pageTotal}
      />
    </main>
  );
}
