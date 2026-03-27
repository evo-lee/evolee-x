# API Reference

English | [简体中文](./api-reference.zh-CN.md)

## Overview

This document explains the main content, SEO, image, and runtime APIs in `evolee-x`. The sections are ordered from documentation context to code entry points so readers can understand the system before reading implementation files.

## Core Content Pipeline

### `parsePostSource(source, filePath)`

- File: `lib/content/frontmatter.ts`
- Input:
  `source`: raw Markdown/MDX file content
  `filePath`: path used in validation error messages
- Output:
  `{ body, frontmatter }` with normalized `PostFrontmatter`
- Logic:
  parses YAML frontmatter with `gray-matter`, validates it with `PostSchema`, and applies safe defaults for tags, `draft`, and `featured`
- Error cases:
  throws when required fields are missing, malformed, or fail schema validation

Example:

```ts
const { body, frontmatter } = parsePostSource(source, 'content/posts/hello-world.mdx');
```

### `processMarkdown(source)`

- File: `lib/content/processor.ts`
- Input:
  `source`: Markdown or MDX body without YAML frontmatter
- Output:
  `{ html, rawHtml, text, excerpt, headings }`
- Logic:
  runs the unified pipeline, builds HTML, extracts headings, generates plain text and excerpt, and rewrites public image URLs to fixed variants
- Error cases:
  propagates parser, syntax-highlighting, or transformation failures

Example:

```ts
const result = await processMarkdown(body);
console.log(result.html);
```

### `resolveCoverImage({ slug, html, cover, coverAlt })`

- File: `lib/content/cover-resolver.ts`
- Input:
  `slug`: post slug
  `html`: rendered body HTML before image rewriting
  `cover`: explicit cover from frontmatter
  `coverAlt`: explicit alt text from frontmatter
- Output:
  `CoverResolution`
- Logic:
  uses a strict fallback chain:
  `cover` -> first body image -> `/images/default-cover.svg`
  then writes a sidecar JSON file to `content/.generated/covers/`
- Error cases:
  propagates filesystem write failures

Example:

```ts
const cover = await resolveCoverImage({ slug, html, cover, coverAlt });
```

### `getAllPosts()` and `getPostBySlug(slug)`

- File: `lib/content/posts.ts`
- Input:
  `slug` for `getPostBySlug`
- Output:
  `PostSummary[]` or `Post | null`
- Logic:
  reads Markdown files, validates frontmatter, processes Markdown, resolves cover images, filters drafts outside development, and sorts posts by date descending
- Error cases:
  non-`ENOENT` read failures and parsing errors are rethrown

Example:

```ts
const posts = await getAllPosts();
const post = await getPostBySlug('hello-world');
```

## Runtime Snapshot APIs

### `getRuntimePosts()`, `getRuntimePostBySlug(slug)`, `getRuntimePages()`

- File: `lib/content/runtime.ts`
- Input:
  `slug` where applicable
- Output:
  runtime entities revived from `content/.generated/runtime-data.json`
- Logic:
  converts serialized ISO date strings back to `Date` objects and exposes Worker-safe lookup helpers
- Error cases:
  no runtime exceptions are expected in normal use; missing entities return `null`

Example:

```ts
const posts = getRuntimePosts();
const page = getRuntimePageBySlug('about');
```

### `scripts/content/build-runtime-data.ts`

- File: `scripts/content/build-runtime-data.ts`
- Input:
  no direct function arguments; executed as a script
- Output:
  writes `content/.generated/runtime-data.json`
- Logic:
  loads posts, pages, tags, categories, and tag counts, then serializes them into a single Worker-friendly snapshot
- Error cases:
  logs failures and exits with status code `1`

Example:

```bash
node --import tsx scripts/content/build-runtime-data.ts
```

## SEO APIs

### `buildSiteMetadata()`

- File: `lib/seo/metadata.ts`
- Output:
  root `Metadata` object for the application
- Logic:
  centralizes default title template, description, author links, and default share image

### `buildPageMetadata(options)`

- File: `lib/seo/metadata.ts`
- Input:
  `path`, `title`, `description`, optional `image`, optional `noIndex`
- Output:
  route-level `Metadata`
- Logic:
  builds canonical, Open Graph, Twitter card, and robots metadata for generic pages

### `buildPostMetadata(post)`

- File: `lib/seo/metadata.ts`
- Input:
  `Post` or `PostSummary`
- Output:
  article-specific `Metadata`
- Logic:
  prefers post-specific SEO fields, applies canonical fallback, builds article Open Graph metadata, and marks drafts as `noindex`

Example:

```ts
const metadata = buildPostMetadata(post);
```

### Structured Data Builders

- File: `lib/seo/structured-data.ts`
- Main functions:
  `buildPersonStructuredData()`
  `buildWebsiteStructuredData()`
  `buildCollectionPageStructuredData()`
  `buildBreadcrumbStructuredData()`
  `buildBlogPostingStructuredData()`
- Logic:
  returns JSON-LD payloads for root layout, homepage, collection pages, and post pages
- Important detail:
  `buildBlogPostingStructuredData()` uses the fixed `og-cover` image variant instead of exposing raw source image URLs

Example:

```ts
const jsonLd = buildBlogPostingStructuredData(post);
```

## Image Delivery APIs

### `getImageUrl(src, variant, options)`

- File: `lib/cloudflare/images.ts`
- Input:
  `src`: original asset path or URL
  `variant`: `thumb-sm | thumb-md | cover-md | cover-lg | og-cover`
  `options.absolute`: whether to return an absolute URL
- Output:
  `/image/{variant}/{token}` or absolute equivalent
- Logic:
  normalizes missing/data URLs to the default cover, encodes the original source into a token, and returns a public route
- Error cases:
  none in normal use; invalid decoding is handled by the route layer

Example:

```ts
const url = getImageUrl('/images/hello-world-cover.svg', 'thumb-md');
```

### `app/image/[variant]/[token]/route.ts`

- File: `app/image/[variant]/[token]/route.ts`
- Input:
  route params `variant` and `token`
- Output:
  proxied image response with cache and diagnostic headers
- Logic:
  validates the variant, decodes the token, fetches the original source, and returns it with `Cache-Control` and `X-Image-*` headers
- Error cases:
  returns `404` for unknown variants or unavailable upstream assets

Example:

```txt
GET /image/thumb-md/L2ltYWdlcy9oZWxsby13b3JsZC1jb3Zlci5zdmc
```

### `ArticleImage` and `CoverImage`

- Files:
  `components/ui/ArticleImage.tsx`
  `components/ui/CoverImage.tsx`
- Input:
  image source, alt text, and optional `priority`
- Output:
  wrapped `next/image` element bound to the correct fixed variant
- Logic:
  list cards always use thumbnail variants; post hero images always use cover variants

## Design Rationale

- Validation is strict and early to keep bad content out of the runtime path.
- Snapshot-based runtime access keeps the Worker layer simple and filesystem-free.
- SEO and image logic are centralized to keep route files thin.
- Public HTML only exposes stable, named image variants.

## Recommended Reading Order

1. `README.md`
2. `docs/phases/`
3. `docs/api-reference.md`
4. `lib/content/*`
5. `lib/seo/*`
6. `app/*` and `components/*`
