import * as path from 'path';
import { listMarkdownFiles, pathToSlug, POSTS_DIR, readUtf8, slugToFileCandidates } from './files';
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

async function loadPostFromFile(filePath: string): Promise<Post> {
  const source = await readUtf8(filePath);
  const { body, frontmatter } = parsePostSource(source, filePath);
  const slug = pathToSlug(POSTS_DIR, filePath);
  const { rawHtml, ...processed } = await processMarkdown(body);
  const coverImage = await resolveCoverImage({
    slug,
    html: rawHtml,
    cover: frontmatter.cover,
    coverAlt: frontmatter.coverAlt,
  });

  return {
    ...frontmatter,
    ...processed,
    slug,
    url: `/posts/${slug}`,
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

export async function getAllPosts(): Promise<PostSummary[]> {
  const posts = await loadAllPosts();
  return posts.map((post) => ({
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
    slug: post.slug,
    url: post.url,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const candidates = slugToFileCandidates(POSTS_DIR, slug);
  for (const filePath of candidates) {
    try {
      const post = await loadPostFromFile(filePath);
      return isVisible(post.draft) ? post : null;
    } catch (error) {
      const maybeMissingFile = error as NodeJS.ErrnoException;
      if (maybeMissingFile.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  return null;
}

export async function getPostsByTag(tag: string): Promise<PostSummary[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getPostsByCategory(category: string): Promise<PostSummary[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}
