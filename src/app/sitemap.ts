import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content/posts";
import { articlePageSize, categoryMap, siteConfig } from "@/lib/site-config";
import { categoryPageUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  const latestPostDate = posts[0]
    ? new Date(posts[0].dateTime)
    : new Date("2011-01-01");

  sitemapEntries.push({
    url: siteConfig.siteUrl,
    // 首页更新信号跟随最新文章，而不是每次请求都用“当前时间”
    lastModified: latestPostDate,
  });

  // 首页分页 /page/2 ...
  const homePageTotal = Math.max(1, Math.ceil(posts.length / articlePageSize));
  for (let page = 2; page <= homePageTotal; page++) {
    const pageStart = (page - 1) * articlePageSize;
    const pageLatest = posts[pageStart];
    sitemapEntries.push({
      url: `${siteConfig.siteUrl}/page/${page}`,
      lastModified: pageLatest ? new Date(pageLatest.dateTime) : latestPostDate,
    });
  }

  // 分类及分类分页
  for (const category of categoryMap) {
    const categoryPosts =
      category.text === "hot"
        ? posts
        : posts.filter((post) => post.categories.includes(category.text));

    if (categoryPosts.length === 0) continue;

    const categoryLastModified =
      category.text === "hot"
        ? latestPostDate
        : new Date(categoryPosts[0].dateTime);

    const categoryPageTotal = Math.max(
      1,
      Math.ceil(categoryPosts.length / articlePageSize),
    );

    for (let page = 1; page <= categoryPageTotal; page++) {
      const pageStart = (page - 1) * articlePageSize;
      const pageLatest = categoryPosts[pageStart];

      sitemapEntries.push({
        url: `${siteConfig.siteUrl}${categoryPageUrl(category.text, page)}`,
        lastModified: pageLatest
          ? new Date(pageLatest.dateTime)
          : categoryLastModified,
      });
    }
  }

  return [
    ...sitemapEntries,
    ...posts.map((post) => ({
      url: `${siteConfig.siteUrl}/${post.slug}`,
      lastModified: new Date(post.dateTime),
    })),
  ];
}
