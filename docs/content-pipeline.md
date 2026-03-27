# Content Pipeline

English | [简体中文](./content-pipeline.zh-CN.md)

## Scope

This document explains how Markdown and MDX content becomes runtime-ready data in `evolee-x`.

## Goals

- validate content before rendering
- derive excerpt, headings, and cover metadata once
- avoid filesystem traversal in Cloudflare Workers
- keep route code focused on rendering, not parsing

## Main Files

- `lib/content/frontmatter.ts`
- `lib/content/processor.ts`
- `lib/content/posts.ts`
- `lib/content/pages.ts`
- `lib/content/cover-resolver.ts`
- `lib/content/runtime.ts`
- `scripts/content/build-runtime-data.ts`

## End-to-End Flow

1. Author writes Markdown or MDX in `content/posts/` or `content/pages/`.
2. `parsePostSource()` or `parsePageSource()` reads and validates frontmatter.
3. `processMarkdown()` renders HTML, extracts headings, plain text, and excerpt.
4. `resolveCoverImage()` picks a cover image and writes a generated sidecar.
5. `getAllPosts()` or `getPostBySlug()` assembles normalized post models.
6. `scripts/content/build-runtime-data.ts` serializes posts, pages, tags, and categories into `content/.generated/runtime-data.json`.
7. `lib/content/runtime.ts` revives that JSON into Worker-safe runtime entities.

## Key Functions

### `parsePostSource(source, filePath)`

- Purpose:
  parse YAML frontmatter and validate the post model
- Input:
  raw source string and source file path
- Output:
  `{ body, frontmatter }`
- Failure mode:
  invalid frontmatter throws immediately

### `processMarkdown(source)`

- Purpose:
  convert article body into renderable and indexable outputs
- Input:
  body without frontmatter
- Output:
  `{ html, rawHtml, text, excerpt, headings }`
- Important detail:
  `rawHtml` is kept for cover extraction before public image rewriting

### `resolveCoverImage({ slug, html, cover, coverAlt })`

- Purpose:
  choose the final cover image for a post
- Fallback chain:
  explicit `cover` -> first image in article HTML -> default cover SVG
- Side effect:
  writes generated JSON under `content/.generated/covers/`

### `getAllPosts()` and `getPostBySlug(slug)`

- Purpose:
  expose normalized post models for routes and scripts
- Important rule:
  drafts are visible only in development

## Data Shapes

The content layer produces two main output levels:

- full entity:
  post or page objects with rendered HTML and headings
- summary entity:
  lightweight list-ready post data for archives, tags, and category pages

## Error Handling Strategy

- schema errors fail early
- missing slug candidates return `null`
- non-`ENOENT` read failures are rethrown
- generated sidecar writes are treated as part of the build contract

## Why This Design

- The expensive work happens once at build time.
- Worker runtime stays JSON-based and predictable.
- Route files do not need parsing, excerpt generation, or cover heuristics.

## Example

```ts
import { getPostBySlug } from '@/lib/content/posts';
import { buildPostMetadata } from '@/lib/seo/metadata';

const post = await getPostBySlug('hello-world');

if (post) {
  const metadata = buildPostMetadata(post);
  console.log(post.headings, metadata.title);
}
```
