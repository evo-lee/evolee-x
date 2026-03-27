import type { MetadataRoute } from 'next';
import { getRuntimeCategories, getRuntimePosts, getRuntimeTags } from '@/lib/content/runtime';
import { siteConfig } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getRuntimePosts();
  const tags = getRuntimeTags();
  const categories = getRuntimeCategories();

  const staticRoutes = ['', '/posts', '/archives', '/about', '/projects'].map((route) => ({
    url: `${siteConfig.baseUrl}${route}`,
  }));

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: `${siteConfig.baseUrl}${post.url}`,
      lastModified: post.updated || post.date,
    })),
    ...tags.map((tag) => ({
      url: `${siteConfig.baseUrl}/tags/${tag}`,
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.baseUrl}/categories/${category}`,
    })),
  ];
}
