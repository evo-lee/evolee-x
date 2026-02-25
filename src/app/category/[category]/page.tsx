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

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

function normalizeCategory(category: string): string {
  return decodeURIComponent(category).trim().toLowerCase();
}

function categoryUrl(category: string): string {
  return `/category/${encodeURIComponent(category)}`;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const query = await searchParams;
  const normalizedCategory = normalizeCategory(category);
  const queryPage = parsePositivePage(query.page);

  if (!isKnownCategory(normalizedCategory)) {
    return {
      title: "分类不存在",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryName = getCategoryName(normalizedCategory);
  const canonicalPath =
    queryPage > 1
      ? `${categoryUrl(normalizedCategory)}/page/${queryPage}`
      : categoryUrl(normalizedCategory);

  return {
    title: `${categoryName} 分类文章`,
    description: `${siteConfig.title}中关于${categoryName}的文章归档与分页列表。`,
    alternates: {
      canonical: `${siteConfig.siteUrl}${canonicalPath}`,
    },
  };
}

function parsePositivePage(pageParam?: string): number {
  if (!pageParam) return 1;
  const parsed = Number(pageParam);
  if (!Number.isFinite(parsed)) return 1;
  const integer = Math.trunc(parsed);
  return integer > 0 ? integer : 1;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const query = await searchParams;
  const normalizedCategory = normalizeCategory(category);
  const queryPage = parsePositivePage(query.page);

  if (!isKnownCategory(normalizedCategory)) {
    notFound();
  }

  if (category !== normalizedCategory) {
    redirect(categoryUrl(normalizedCategory));
  }

  if (query.page && queryPage <= 1) {
    redirect(categoryUrl(normalizedCategory));
  }

  if (queryPage > 1) {
    redirect(`${categoryUrl(normalizedCategory)}/page/${queryPage}`);
  }

  const listing = await getPostListing({ category: normalizedCategory });

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
