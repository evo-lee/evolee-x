import { readFile } from 'fs/promises';
import * as path from 'path';
import { getAllPosts } from './posts';

const TAG_METADATA_PATH = path.join(process.cwd(), 'content', 'taxonomy', 'tags.json');

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  return Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b));
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return Array.from(new Set(posts.flatMap((post) => (post.category ? [post.category] : [])))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export async function getTagCounts(): Promise<Record<string, number>> {
  const posts = await getAllPosts();
  return posts.reduce<Record<string, number>>((counts, post) => {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
    return counts;
  }, {});
}

export async function getTagMetadata(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(TAG_METADATA_PATH, 'utf8');
    return JSON.parse(raw) as Record<string, string>;
  } catch (error) {
    const maybeMissingFile = error as NodeJS.ErrnoException;
    if (maybeMissingFile.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}
