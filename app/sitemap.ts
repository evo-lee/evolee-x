import type { MetadataRoute } from 'next';
import {
  getRuntimeCategories,
  getRuntimePostBySlug,
  getRuntimePosts,
  getRuntimeTags,
} from '@/lib/content/runtime';
import { siteConfig } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getRuntimePosts();
  const tags = getRuntimeTags();
  const categories = getRuntimeCategories();

  const staticRoutes = ['', '/posts', '/projects', '/about'].map((path) => ({
    url: `${siteConfig.baseUrl}${path || '/'}`,
  }));

  const postRoutes = posts.flatMap((summary) => {
    const post = getRuntimePostBySlug(summary.slug);
    if (!post) return [];
    return [{
      url: `${siteConfig.baseUrl}${post.url}`,
      lastModified: post.updated || post.date,
    }];
  });

  const tagRoutes = tags.map((tag) => ({
    url: `${siteConfig.baseUrl}/tags/${encodeURIComponent(tag)}`,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${siteConfig.baseUrl}/categories/${encodeURIComponent(category)}`,
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes, ...categoryRoutes];
}
