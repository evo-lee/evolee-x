import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleList } from "@/components/article-list";
import { CategoryNav } from "@/components/category-nav";
import { PaginationNav } from "@/components/pagination-nav";
import { getPostListing, isKnownCategory } from "@/lib/content/listings";
import { siteConfig } from "@/lib/site-config";

interface HomePageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

function parsePositivePage(pageParam?: string): number {
  if (!pageParam) return 1;
  const parsed = Number(pageParam);
  if (!Number.isFinite(parsed)) return 1;
  const integer = Math.trunc(parsed);
  return integer > 0 ? integer : 1;
}

function buildCategoryUrl(category: string, page: number): string {
  const encodedCategory = encodeURIComponent(category);
  if (page <= 1) {
    return `/category/${encodedCategory}`;
  }
  return `/category/${encodedCategory}/page/${page}`;
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawCategory = params.category?.trim().toLowerCase();
  const page = parsePositivePage(params.page);

  if (rawCategory) {
    if (!isKnownCategory(rawCategory)) {
      return {
        title: "分类不存在",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    return {
      alternates: {
        canonical: `${siteConfig.siteUrl}${buildCategoryUrl(rawCategory, page)}`,
      },
    };
  }

  const canonical =
    page > 1 ? `${siteConfig.siteUrl}/?page=${page}` : siteConfig.siteUrl;

  return {
    alternates: {
      canonical,
    },
    title: page > 1 ? `第 ${page} 页` : undefined,
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const rawCategory = params.category?.trim().toLowerCase();
  const page = parsePositivePage(params.page);

  if (rawCategory) {
    if (!isKnownCategory(rawCategory)) {
      notFound();
    }

    redirect(buildCategoryUrl(rawCategory, page));
  }

  if (params.page && page <= 1) {
    redirect("/");
  }

  const listing = await getPostListing({ pageParam: params.page });

  if (listing.requestedPage > listing.pageTotal) {
    notFound();
  }

  return (
    <main className="pb-8 pt-2">
      <CategoryNav />
      <ArticleList
        posts={listing.visiblePosts}
        hitsMap={listing.hitsMap}
        hitsLoading={listing.hitsLoading}
      />
      <PaginationNav page={listing.page} pageTotal={listing.pageTotal} />
    </main>
  );
}
