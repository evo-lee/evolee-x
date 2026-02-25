import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content/posts";
import { categoryMap, siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const categoryEntries: MetadataRoute.Sitemap = [];

  for (const category of categoryMap) {
    const latestPostInCategory =
      category.text === "hot"
        ? posts[0]
        : posts.find((post) => post.categories.includes(category.text));

    if (!latestPostInCategory) {
      continue;
    }

    categoryEntries.push({
      url: `${siteConfig.siteUrl}/category/${category.text}`,
      lastModified: new Date(latestPostInCategory.dateTime),
    });
  }

  return [
    {
      url: siteConfig.siteUrl,
      lastModified: new Date(),
    },
    ...categoryEntries,
    ...posts.map((post) => ({
      url: `${siteConfig.siteUrl}/${post.slug}`,
      lastModified: new Date(post.dateTime),
    })),
  ];
}
