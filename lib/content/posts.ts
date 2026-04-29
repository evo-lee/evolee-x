import { stat } from 'fs/promises';
import * as path from 'path';
import type { AppLocale } from '@/lib/i18n/config';
import { localeHref } from '@/lib/i18n/route';
import {
  listMarkdownFiles,
  pathToLocale,
  pathToSlug,
  POSTS_DIR,
  readUtf8,
  slugToFileCandidates,
} from './files';
import { parsePostSource } from './frontmatter';
import { processMarkdown } from './processor';
import { resolveCoverImage } from './cover-resolver';
import type { Post, PostSummary } from './types';

function isVisible(draft: boolean): boolean {
  return process.env.NODE_ENV === 'development' || !draft;
}

function comparePosts(a: PostSummary, b: PostSummary): number {
  return b.date.getTime() - a.date.getTime();
}

function selectLocalizedItems<T extends { locale: AppLocale; date: Date }>(
  items: T[],
  locale: AppLocale
): T[] {
  return items
    .filter((item) => item.locale === locale)
    .sort((left, right) => right.date.getTime() - left.date.getTime());
}

async function loadPostFromFile(filePath: string): Promise<Post> {
  const fileStats = await stat(filePath);
  const source = await readUtf8(filePath);
  const { body, frontmatter } = parsePostSource(source, filePath, {
    fallbackDate: fileStats.mtime,
  });
  const slug = pathToSlug(POSTS_DIR, filePath);
  const locale = pathToLocale(POSTS_DIR, filePath);
  const { rawHtml, ...processed } = await processMarkdown(body);
  const coverImage = await resolveCoverImage({
    slug,
    html: rawHtml,
    cover: frontmatter.cover,
    coverAlt: frontmatter.coverAlt,
  });

  return {
    ...frontmatter,
    locale,
    ...processed,
    slug,
    url: localeHref(locale, `/posts/${slug}`),
    sourcePath: path.relative(process.cwd(), filePath),
    content: body,
    excerpt: frontmatter.summary || processed.excerpt,
    coverImage,
  };
}

async function loadAllPosts(): Promise<Post[]> {
  const files = await listMarkdownFiles(POSTS_DIR);
  const posts = await Promise.all(files.map(loadPostFromFile));
  return posts.filter((post) => isVisible(post.draft)).sort(comparePosts);
}

export async function getAllPostVariants(): Promise<Post[]> {
  return loadAllPosts();
}

/**
 * Load all visible post summaries for list pages and taxonomy pages.
 *
 * @returns Posts sorted by publication date descending.
 * @throws Propagates filesystem, frontmatter, or Markdown processing failures.
 */
export async function getAllPosts(locale: AppLocale = 'zh-CN'): Promise<PostSummary[]> {
  const posts = await loadAllPosts();
  const summaries = posts.map((post) => ({
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

  return selectLocalizedItems(summaries, locale);
}

/**
 * Load a full post by slug, including rendered HTML and heading metadata.
 *
 * @param slug Route slug relative to `content/posts`.
 * @returns Full post object, or `null` if the file does not exist or is hidden as a draft.
 * @throws Propagates non-ENOENT read or parsing errors.
 */
export async function getPostBySlug(slug: string, locale: AppLocale = 'zh-CN'): Promise<Post | null> {
  const candidates = slugToFileCandidates(POSTS_DIR, slug, locale);
  for (const filePath of candidates) {
    try {
      const post = await loadPostFromFile(filePath);
      return isVisible(post.draft) && post.locale === locale ? post : null;
    } catch (error) {
      const maybeMissingFile = error as NodeJS.ErrnoException;
      if (maybeMissingFile.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  return null;
}

/**
 * Filter visible posts by tag using the built post summary list.
 *
 * @param tag Exact tag value.
 * @returns Visible posts that include the requested tag.
 */
export async function getPostsByTag(tag: string, locale: AppLocale = 'zh-CN'): Promise<PostSummary[]> {
  const posts = await getAllPosts(locale);
  return posts.filter((post) => post.tags.includes(tag));
}

/**
 * Filter visible posts by category using the built post summary list.
 *
 * @param category Exact category value.
 * @returns Visible posts that belong to the requested category.
 */
export async function getPostsByCategory(
  category: string,
  locale: AppLocale = 'zh-CN'
): Promise<PostSummary[]> {
  const posts = await getAllPosts(locale);
  return posts.filter((post) => post.category === category);
}
