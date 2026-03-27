#!/usr/bin/env tsx

import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getAllPages } from '@/lib/content/pages';
import { getAllPosts, getPostBySlug } from '@/lib/content/posts';
import { getAllCategories, getAllTags, getTagCounts } from '@/lib/content/taxonomy';

const OUTPUT_PATH = path.join(process.cwd(), 'content', '.generated', 'runtime-data.json');

async function main() {
  const posts = await getAllPosts();
  const fullPosts = await Promise.all(posts.map((post) => getPostBySlug(post.slug)));
  const pages = await getAllPages();
  const tags = await getAllTags();
  const categories = await getAllCategories();
  const tagCounts = await getTagCounts();

  const payload = {
    generatedAt: new Date().toISOString(),
    posts,
    postMap: Object.fromEntries(
      fullPosts.filter((post): post is NonNullable<typeof post> => post !== null).map((post) => [post.slug, post])
    ),
    pages,
    tags,
    categories,
    tagCounts,
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
