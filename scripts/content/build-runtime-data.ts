#!/usr/bin/env tsx

import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getAllPageVariants } from '@/lib/content/pages';
import { getAllPostVariants } from '@/lib/content/posts';

const OUTPUT_PATH = path.join(process.cwd(), 'content', '.generated', 'runtime-data.json');

/**
 * Build the content snapshot consumed by Cloudflare-compatible runtime loaders.
 *
 * The snapshot removes any need for runtime filesystem directory traversal in Worker mode.
 *
 * @returns Resolves when `content/.generated/runtime-data.json` has been written.
 * @throws Propagates content loading or filesystem write errors and exits the process with code 1.
 */
async function main() {
  const fullPosts = await getAllPostVariants();
  const pages = await getAllPageVariants();
  const posts = fullPosts.map((post) => ({
    title: post.title,
    description: post.description,
    date: post.date,
    updated: post.updated,
    tags: post.tags,
    category: post.category,
    draft: post.draft,
    featured: post.featured,
    author: post.author,
    canonical: post.canonical,
    summary: post.summary,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    cover: post.cover,
    coverAlt: post.coverAlt,
    thumbnail: post.thumbnail,
    thumbnailAlt: post.thumbnailAlt,
    imageCredit: post.imageCredit,
    ogImage: post.ogImage,
    locale: post.locale,
    slug: post.slug,
    url: post.url,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    posts,
    postMap: Object.fromEntries(
      fullPosts.map((post) => [
        `${post.slug}:${post.locale}`,
        post,
      ])
    ),
    pages,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`[content:build] Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error('[content:build] Failed to build runtime data');
  console.error(error);
  process.exit(1);
});
