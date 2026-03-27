import { readdir, readFile } from 'fs/promises';
import * as path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
export const PAGES_DIR = path.join(CONTENT_DIR, 'pages');
export const GENERATED_DIR = path.join(CONTENT_DIR, '.generated');
export const GENERATED_COVERS_DIR = path.join(GENERATED_DIR, 'covers');
export const GENERATED_SEARCH_INDEX = path.join(GENERATED_DIR, 'search-index.json');

export function pathToSlug(baseDir: string, filePath: string): string {
  return path.relative(baseDir, filePath).replace(/\\/g, '/').replace(/\.mdx?$/, '');
}

export function slugToFileCandidates(baseDir: string, slug: string): string[] {
  return [path.join(baseDir, `${slug}.mdx`), path.join(baseDir, `${slug}.md`)];
}

export async function readUtf8(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8');
}

export async function listMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return listMarkdownFiles(fullPath);
        }
        if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
          return [fullPath];
        }
        return [];
      })
    );
    return files.flat().sort();
  } catch (error) {
    const maybeMissingDir = error as NodeJS.ErrnoException;
    if (maybeMissingDir.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}
