import matter from 'gray-matter';
import { z } from 'zod';
import type { PageFrontmatter, PostFrontmatter } from './types';

const dateField = z.coerce.date();

export const PostSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: dateField,
  updated: dateField.optional(),
  tags: z.array(z.string().min(1)).default([]),
  category: z.string().min(1).optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  author: z.string().min(1).optional(),
  canonical: z.string().url().optional(),
  summary: z.string().min(1).optional(),
  seoTitle: z.string().min(1).optional(),
  seoDescription: z.string().min(1).optional(),
  cover: z.string().min(1).optional(),
  coverAlt: z.string().min(1).optional(),
  thumbnail: z.string().min(1).optional(),
  thumbnailAlt: z.string().min(1).optional(),
  imageCredit: z.string().min(1).optional(),
  ogImage: z.string().min(1).optional(),
});

export const PageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  draft: z.boolean().default(false),
  updated: dateField.optional(),
});

function formatZodError(error: z.ZodError, filePath: string): Error {
  const details = error.issues
    .map((issue) => {
      const location = issue.path.length > 0 ? issue.path.join('.') : 'frontmatter';
      return `${location}: ${issue.message}`;
    })
    .join('; ');
  return new Error(`Invalid frontmatter in ${filePath}: ${details}`);
}

function parseSource<T>(schema: z.ZodType<T>, source: string, filePath: string): {
  body: string;
  frontmatter: T;
} {
  const parsed = matter(source);
  const result = schema.safeParse(parsed.data);
  if (!result.success) {
    throw formatZodError(result.error, filePath);
  }
  return {
    body: parsed.content.trim(),
    frontmatter: result.data as T,
  };
}

export function parsePostSource(source: string, filePath: string): {
  body: string;
  frontmatter: PostFrontmatter;
} {
  const parsed = parseSource(PostSchema, source, filePath);
  return {
    body: parsed.body,
    frontmatter: {
      ...parsed.frontmatter,
      tags: parsed.frontmatter.tags ?? [],
      draft: parsed.frontmatter.draft ?? false,
      featured: parsed.frontmatter.featured ?? false,
    },
  };
}

export function parsePageSource(source: string, filePath: string): {
  body: string;
  frontmatter: PageFrontmatter;
} {
  const parsed = parseSource(PageSchema, source, filePath);
  return {
    body: parsed.body,
    frontmatter: {
      ...parsed.frontmatter,
      draft: parsed.frontmatter.draft ?? false,
    },
  };
}
