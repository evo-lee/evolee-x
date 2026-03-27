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

/**
 * Parse a Markdown or MDX source string with a supplied frontmatter schema.
 *
 * @param schema Zod schema used to validate and normalize frontmatter.
 * @param source Raw file contents including YAML frontmatter and body.
 * @param filePath Repository-relative or absolute path used in error output.
 * @returns Parsed content body and schema-validated frontmatter object.
 * @throws Error when the frontmatter does not satisfy the schema.
 */
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

/**
 * Parse and validate a post source file.
 *
 * @param source Raw Markdown or MDX source.
 * @param filePath Source path used for validation messages.
 * @returns Normalized post frontmatter and trimmed Markdown body.
 * @throws Error when required fields are missing or malformed.
 */
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

/**
 * Parse and validate a content page source file.
 *
 * @param source Raw Markdown or MDX source.
 * @param filePath Source path used for validation messages.
 * @returns Normalized page frontmatter and trimmed Markdown body.
 * @throws Error when required fields are missing or malformed.
 */
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
