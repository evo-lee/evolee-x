import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';
import { GENERATED_SEARCH_INDEX } from './files';
import { getAllPostVariants, getPostBySlug } from './posts';
import type { SearchIndexEntry } from './types';

export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  const posts = await getAllPostVariants();
  const entries = await Promise.all(
    posts.map(async (post) => {
      const fullPost = await getPostBySlug(post.slug, post.locale);
      if (!fullPost) {
        return null;
      }

      return {
        locale: post.locale,
        slug: post.slug,
        title: post.title,
        description: post.description,
        summary: post.excerpt,
        category: post.category,
        tags: post.tags,
        text: fullPost.text,
      } satisfies SearchIndexEntry;
    })
  );

  return entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export async function writeSearchIndex(): Promise<SearchIndexEntry[]> {
  const entries = await buildSearchIndex();
  await mkdir(path.dirname(GENERATED_SEARCH_INDEX), { recursive: true });
  await writeFile(GENERATED_SEARCH_INDEX, JSON.stringify(entries, null, 2));
  return entries;
}
