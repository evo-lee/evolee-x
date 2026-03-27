# API Reference

English | [简体中文](./api-reference.zh-CN.md)

## Overview

This document explains the main functions and scripts that shape the content, SEO, image, search, analytics, AI tooling, and operations layers in `evolee-x`.

The structure is intentional:

1. Documentation context
2. Function-level reference
3. Design rationale
4. Example call flows

There are no long-lived service classes in the current codebase. The architecture is mostly organized around focused functions and build scripts.

## Content Pipeline APIs

### `parsePostSource(source, filePath)`

- File: `lib/content/frontmatter.ts`
- Parameters:
  `source`: raw Markdown/MDX source including YAML frontmatter
  `filePath`: source path used to format validation errors
- Returns:
  `{ body, frontmatter }`
- Logic:
  parses frontmatter with `gray-matter`, validates it with `PostSchema`, normalizes defaults for optional fields, and returns the stripped body plus validated metadata
- Error cases:
  throws when required fields are missing, dates are invalid, arrays are malformed, or Zod validation fails

Example:

```ts
const { body, frontmatter } = parsePostSource(source, 'content/posts/hello-world.mdx');
```

### `processMarkdown(source)`

- File: `lib/content/processor.ts`
- Parameters:
  `source`: Markdown/MDX body without YAML frontmatter
- Returns:
  `{ html, rawHtml, text, excerpt, headings }`
- Logic:
  runs the unified rendering pipeline, extracts headings, produces sanitized HTML, keeps a raw HTML version for image inspection, generates plain text, and derives an excerpt
- Error cases:
  propagates Markdown parsing, rehype, highlighting, or sanitization failures

Example:

```ts
const rendered = await processMarkdown(body);
console.log(rendered.headings);
```

### `resolveCoverImage({ slug, html, cover, coverAlt })`

- File: `lib/content/cover-resolver.ts`
- Parameters:
  `slug`: post slug used for sidecar naming
  `html`: rendered raw HTML before public image rewriting
  `cover`: optional explicit frontmatter cover
  `coverAlt`: optional explicit frontmatter alt text
- Returns:
  `CoverResolution`
- Logic:
  applies a strict fallback chain:
  explicit `cover` -> first image found in article HTML -> `/images/default-cover.svg`
  then writes a generated JSON sidecar under `content/.generated/covers/`
- Error cases:
  propagates filesystem write failures

Example:

```ts
const coverImage = await resolveCoverImage({ slug, html, cover, coverAlt });
```

### `getAllPosts()`

- File: `lib/content/posts.ts`
- Parameters:
  none
- Returns:
  `Promise<PostSummary[]>`
- Logic:
  loads all post files, parses frontmatter, renders Markdown, resolves cover images, filters drafts outside development, and returns summaries sorted by descending date
- Error cases:
  propagates filesystem, frontmatter, Markdown, or cover-resolution failures

Example:

```ts
const posts = await getAllPosts();
```

### `getPostBySlug(slug)`

- File: `lib/content/posts.ts`
- Parameters:
  `slug`: route slug relative to `content/posts`
- Returns:
  `Promise<Post | null>`
- Logic:
  checks candidate Markdown filenames, loads the first match, and returns `null` if the post is missing or hidden as a draft outside development
- Error cases:
  ignores `ENOENT` when checking slug candidates
  rethrows other read, parse, or render errors

Example:

```ts
const post = await getPostBySlug('hello-world');
```

### `getPostsByTag(tag)` and `getPostsByCategory(category)`

- File: `lib/content/posts.ts`
- Parameters:
  `tag`: exact tag string
  `category`: exact category string
- Returns:
  filtered `Promise<PostSummary[]>`
- Logic:
  builds on `getAllPosts()` and applies exact-match filtering
- Error cases:
  inherits failures from `getAllPosts()`

## Runtime Snapshot APIs

### `getRuntimePosts()`, `getRuntimePostBySlug(slug)`, `getRuntimePages()`, `getRuntimePageBySlug(slug)`

- File: `lib/content/runtime.ts`
- Parameters:
  `slug` where applicable
- Returns:
  runtime entities revived from `content/.generated/runtime-data.json`
- Logic:
  converts serialized ISO dates back into `Date` objects and exposes Worker-safe lookup helpers
- Error cases:
  missing entries return `null`; normal use should not throw

Example:

```ts
const aboutPage = getRuntimePageBySlug('about');
```

### `scripts/content/build-runtime-data.ts`

- File: `scripts/content/build-runtime-data.ts`
- Parameters:
  none; script entry point
- Returns:
  writes `content/.generated/runtime-data.json`
- Logic:
  collects posts, pages, tags, categories, and counts into a single Worker-friendly runtime snapshot
- Error cases:
  prints the failure and exits with status code `1`

Example:

```bash
node --import tsx scripts/content/build-runtime-data.ts
```

## SEO and Metadata APIs

### `buildSiteMetadata()`

- File: `lib/seo/metadata.ts`
- Parameters:
  none
- Returns:
  root `Metadata`
- Logic:
  defines the site-level title template, default description, author information, canonical base, and default OG/Twitter image
- Error cases:
  none in normal use

### `buildPageMetadata({ path, title, description, image, noIndex })`

- File: `lib/seo/metadata.ts`
- Parameters:
  `path`: page pathname
  `title`: page title
  `description`: summary text
  `image`: optional social image source
  `noIndex`: optional robots override
- Returns:
  generic page `Metadata`
- Logic:
  builds canonical URL, Open Graph data, Twitter card data, and optional robots noindex flags in one place
- Error cases:
  none in normal use

### `buildPostMetadata(post)`

- File: `lib/seo/metadata.ts`
- Parameters:
  `post`: `Post` or `PostSummary`
- Returns:
  article `Metadata`
- Logic:
  prefers SEO-specific title and description fields, computes canonical fallback, builds article OG metadata, applies tag/category metadata, and marks drafts `noindex`
- Error cases:
  none in normal use if the post shape is valid

Example:

```ts
const metadata = buildPostMetadata(post);
```

### `buildPageContentMetadata(page)`

- File: `lib/seo/metadata.ts`
- Parameters:
  `page`: runtime Markdown-backed page entity
- Returns:
  generic page `Metadata`
- Logic:
  adapts a Markdown page model into the standard page metadata builder

### Structured data builders

- File: `lib/seo/structured-data.ts`
- Main functions:
  `buildPersonStructuredData()`
  `buildWebsiteStructuredData()`
  `buildCollectionPageStructuredData()`
  `buildBreadcrumbStructuredData()`
  `buildBlogPostingStructuredData()`
- Logic:
  emits JSON-LD payloads for the root layout, homepage, collection pages, and articles
- Important detail:
  `buildBlogPostingStructuredData()` uses fixed image variants instead of leaking raw image source URLs

## Image Delivery APIs

### `encodeImageToken(src)` and `decodeImageToken(token)`

- File: `lib/cloudflare/images.ts`
- Parameters:
  `src`: original image path or URL
  `token`: base64url token from the public image route
- Returns:
  encoded or decoded string
- Logic:
  converts original image references to URL-safe tokens used by the public image route
- Error cases:
  malformed token decoding is handled by the route layer that consumes the token

### `getImageUrl(src, variant, options)`

- File: `lib/cloudflare/images.ts`
- Parameters:
  `src`: original asset path or URL
  `variant`: named variant from `VARIANT_CATALOG`
  `options.absolute`: optional absolute-URL switch
- Returns:
  `/image/{variant}/{token}` or absolute equivalent
- Logic:
  normalizes missing and `data:` sources to the default cover image, encodes the source, and exposes only the public route shape
- Error cases:
  none in normal use

Example:

```ts
const ogUrl = getImageUrl('/images/cover.svg', 'og-cover', { absolute: true });
```

### `getVariantConfig(variant)`, `getThumbVariant(width)`, `getCoverVariant(width)`

- File: `lib/cloudflare/images.ts`
- Parameters:
  `variant`: image variant name
  `width`: desired width bucket
- Returns:
  variant metadata or variant key
- Logic:
  keeps width, height, and aspect-ratio decisions centralized so components use stable image shapes

### `app/image/[variant]/[token]/route.ts`

- File: `app/image/[variant]/[token]/route.ts`
- Parameters:
  route params `variant` and `token`
- Returns:
  proxied image response with cache and diagnostic headers
- Logic:
  validates the variant, decodes the token, fetches the upstream asset, and returns a controlled image response
- Error cases:
  returns `404` for unknown variants or unavailable upstream assets

## Search APIs

### `primeSearchIndex()`

- File: `lib/search/client.ts`
- Parameters:
  none
- Returns:
  `Promise<void>`
- Logic:
  lazily loads `/search-index.json`, initializes a cached Fuse.js instance, and prepares future searches without blocking initial page render
- Error cases:
  resets its internal promise cache when loading fails so later retries can succeed

### `searchDocuments(query)`

- File: `lib/search/client.ts`
- Parameters:
  `query`: raw user input
- Returns:
  `Promise<SearchResult[]>`
- Logic:
  trims input, returns an empty array for blank queries, loads the cached Fuse index if needed, and searches across title, summary, description, tags, and category with weighted keys
- Error cases:
  propagates search-index fetch failures

Example:

```ts
const results = await searchDocuments('workers');
```

## Analytics APIs

### `trackEvent(name, params?)`

- File: `lib/analytics/track.ts`
- Parameters:
  `name`: registered analytics event name
  `params`: optional event payload
- Returns:
  `void`
- Logic:
  looks up the event in `ANALYTICS_EVENT_REGISTRY`, checks provider availability with `hasUmami()` and `hasGA4()`, and dispatches the event to the correct target system
- Error cases:
  unknown event names are ignored with a development warning
  provider dispatch failures are caught so analytics never block UI behavior

Example:

```ts
trackEvent('copy_code', {
  slug: 'hello-world',
});
```

### `ANALYTICS_EVENT_REGISTRY`

- File: `lib/analytics/event-registry.ts`
- Purpose:
  central event ownership map that decides whether an event belongs to Umami, GA4, or both
- Design note:
  the registry prevents component-level provider drift and makes event review explicit

### `hasUmami()` and `hasGA4()`

- File: `lib/analytics/providers.ts`
- Purpose:
  lightweight runtime guards for checking whether each provider is enabled and present

## AI Tooling APIs

### `runTool(context)`

- File: `scripts/ai/shared/run-tool.ts`
- Parameters:
  `context`: tool metadata including prompt path, schema, tool name, and output behavior
- Returns:
  `Promise<void>`
- Logic:
  parses CLI arguments, resolves target files, reads file inputs, sends a structured request to the Anthropic client, validates the JSON response, writes JSON and Markdown reports, and prints a summary
- Error cases:
  throws when no valid CLI mode is provided
  propagates file-resolution, API, schema-validation, and write failures
- CLI modes:
  `--file <path>`
  `--glob <pattern>`
  `--changed-files`
  optional `--dry-run`

Example:

```bash
npm run ai:seo-suggest -- --glob "content/posts/*.mdx"
```

### `scripts/ai/shared/client.ts`

- File: `scripts/ai/shared/client.ts`
- Purpose:
  sends the prompt payload to Anthropic and validates the structured response
- Error cases:
  throws if the provider-specific API key is missing

## Operations and Reporting APIs

### `GET /api/health`

- File: `app/api/health/route.ts`
- Parameters:
  none
- Returns:
  JSON payload:
  `{ ok, status, version, env, timestamp }`
- Logic:
  exposes a simple health signal that also includes package version and current environment for diagnostics
- Error cases:
  none in normal use

Example:

```txt
GET /api/health
```

### `scripts/ci/build-report.ts`

- File: `scripts/ci/build-report.ts`
- Parameters:
  none; script entry point
- Returns:
  writes:
  `reports/build/latest-build-report.json`
  `reports/build/latest-build-report.md`
- Logic:
  reads `.next/server/app-paths-manifest.json`, counts routes, splits static and dynamic routes, records warnings, and emits both JSON and Markdown output
- Error cases:
  exits with status code `1` when required build artifacts are missing or unreadable
- Important note:
  the `.gitkeep` warning is added after the report object is created, so the current written report may not include that warning unless the script is adjusted later

Example:

```bash
node --import tsx scripts/ci/build-report.ts
```

## Key Design Rationale

### Content layer

- validate early
- derive summaries and headings once
- keep Worker runtime data precomputed

### SEO and images

- centralize metadata policy
- expose only fixed image variants
- keep routes thin and deterministic

### Search and analytics

- lazy-load non-critical client systems
- fail open when optional systems break
- route all analytics through one event vocabulary

### AI and operations

- keep AI tooling as explicit CLI entry points, not hidden build steps
- emit machine-readable and human-readable reports for review

## Example Call Flows

### Post rendering flow

1. `parsePostSource()` validates frontmatter.
2. `processMarkdown()` renders the body and derives excerpt/headings.
3. `resolveCoverImage()` chooses the final cover image.
4. `getPostBySlug()` assembles the final post model.
5. `buildPostMetadata()` derives SEO fields for the route.

### Search flow

1. `SearchTrigger` opens the search UI.
2. `primeSearchIndex()` optionally warms the index.
3. `searchDocuments(query)` loads `/search-index.json` on demand.
4. Fuse.js returns weighted matches for rendering.

### Analytics flow

1. UI component calls `trackEvent(name, params)`.
2. Event registry resolves ownership.
3. Provider guards confirm whether Umami or GA4 is active.
4. Dispatch happens in a `try/catch` block so UI never depends on analytics success.

## Recommended Reading Order

1. [README.md](../README.md)
2. [`docs/phases/`](./phases)
3. [docs/api-reference.md](./api-reference.md)
4. `lib/content/*`
5. `lib/seo/*`, `lib/cloudflare/*`
6. `lib/search/*`, `lib/analytics/*`
7. `scripts/*`
