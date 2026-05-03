import { readdir, readFile } from 'fs/promises';
import * as path from 'path';
import { isAppLocale, type AppLocale } from '@/lib/i18n/config';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
export const PAGES_DIR = path.join(CONTENT_DIR, 'pages');
export const GENERATED_DIR = path.join(CONTENT_DIR, '.generated');
export const GENERATED_COVERS_DIR = path.join(GENERATED_DIR, 'covers');
export const GENERATED_SEARCH_INDEX = path.join(GENERATED_DIR, 'search-index.json');

export function pathToSlug(baseDir: string, filePath: string): string {
  return parseLocalizedContentPath(baseDir, filePath).slug;
}

export function pathToLocale(baseDir: string, filePath: string): AppLocale {
  return parseLocalizedContentPath(baseDir, filePath).locale;
}

export function parseLocalizedContentPath(
  baseDir: string,
  filePath: string
): {
  slug: string;
  locale: AppLocale;
} {
  const relative = path
    .relative(baseDir, filePath)
    .replace(/\\/g, '/')
    .replace(/\.mdx?$/, '');
  const match = relative.match(/^(.*)\.(zh-CN|en)$/i);

  if (!match) {
    return { slug: relative, locale: 'zh-CN' };
  }

  return {
    slug: match[1],
    locale: isAppLocale(match[2]) ? match[2] : 'zh-CN',
  };
}

function buildCandidateStems(slug: string, locale: AppLocale): string[] {
  const stems = new Set<string>();
  stems.add(`${slug}.${locale}`);
  if (locale !== 'zh-CN') {
    stems.add(`${slug}.zh-CN`);
  }
  stems.add(slug);
  return [...stems];
}

export function slugToFileCandidates(
  baseDir: string,
  slug: string,
  locale: AppLocale = 'zh-CN'
): string[] {
  return buildCandidateStems(slug, locale).flatMap((stem) => [
    path.join(baseDir, `${stem}.mdx`),
    path.join(baseDir, `${stem}.md`),
  ]);
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
