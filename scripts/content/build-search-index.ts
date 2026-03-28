#!/usr/bin/env tsx

import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getAllPostVariants } from '@/lib/content/posts';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'search-index.json');

async function main() {
  const posts = await getAllPostVariants();
  const payload = posts.map((post) => ({
    locale: post.locale,
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    category: post.category,
    date: post.date.toISOString(),
    summary: post.excerpt,
  }));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`[search:build] Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error('[search:build] Failed to build search index');
  console.error(error);
  process.exit(1);
});
