import * as path from 'path';
import { listMarkdownFiles, PAGES_DIR, pathToSlug, readUtf8, slugToFileCandidates } from './files';
import { parsePageSource } from './frontmatter';
import { processMarkdown } from './processor';
import type { Page } from './types';

function isVisible(draft: boolean): boolean {
  return process.env.NODE_ENV === 'development' || !draft;
}

async function loadPageFromFile(filePath: string): Promise<Page> {
  const source = await readUtf8(filePath);
  const { body, frontmatter } = parsePageSource(source, filePath);
  const slug = pathToSlug(PAGES_DIR, filePath);
  const processed = await processMarkdown(body);

  return {
    ...frontmatter,
    html: processed.html,
    excerpt: processed.excerpt,
    text: processed.text,
    headings: processed.headings,
    slug,
    url: `/${slug}`,
    sourcePath: path.relative(process.cwd(), filePath),
    content: body,
  };
}

export async function getAllPages(): Promise<Page[]> {
  const files = await listMarkdownFiles(PAGES_DIR);
  const pages = await Promise.all(files.map(loadPageFromFile));
  return pages.filter((page) => isVisible(page.draft));
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const candidates = slugToFileCandidates(PAGES_DIR, slug);
  for (const filePath of candidates) {
    try {
      const page = await loadPageFromFile(filePath);
      return isVisible(page.draft) ? page : null;
    } catch (error) {
      const maybeMissingFile = error as NodeJS.ErrnoException;
      if (maybeMissingFile.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  return null;
}
