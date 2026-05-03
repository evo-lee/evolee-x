# evolee-x

English | [简体中文](./README.zh-CN.md)

## Project Overview

`evolee-x` is a personal publishing site built with Next.js 15 App Router and
OpenNext for Cloudflare Workers. It is designed for essays, technical writing,
reading notes, projects, and long-form pages while keeping the runtime
edge-compatible and database-free.

The current implementation uses generated content artifacts for runtime reads,
real locale routes for Cloudflare compatibility, and centralized helpers for SEO,
images, analytics, search, and typography.

## Feature Coverage

- Markdown/MDX content pipeline with Zod-validated frontmatter.
- Generated runtime snapshot at `content/.generated/runtime-data.json`.
- Generated client search index at `public/search-index.json`.
- Real locale routes under `app/[locale]/` for `/en` and `/zh-CN`.
- Unprefixed routes under `app/(site)/` using the default Chinese locale.
- Current pages: home, posts list, post detail, projects, and about.
- Locale-aware content resolution with English fallback to Chinese content.
- SEO routes and helpers for metadata, JSON-LD, RSS, sitemap, and robots.
- Cloudflare image route and custom image loader helpers.
- Article rendering, table of contents, copy buttons, site shell, and localized nav.
- Search bar backed by the generated search index.
- Umami and GA4 analytics behind public feature flags.
- AI editorial CLI tools for proofreading, summaries, SEO suggestions, and typography review.
- Health endpoint at `/api/health`.

## Project Structure

- `app/(site)/`: unprefixed site routes using the default `zh-CN` locale.
- `app/[locale]/`: concrete localized routes for `/en` and `/zh-CN`.
- `app/api/health/route.ts`: health check endpoint.
- `app/image/[variant]/[token]/route.ts`: public image route.
- `app/rss.xml/route.ts`, `app/robots.ts`, `app/sitemap.ts`: metadata routes.
- `components/`: article, site shell, analytics, SEO, and dev-only UI components.
- `content/posts/`: source post content.
- `content/pages/`: source page content such as `about.mdx` and `about.en.mdx`.
- `content/.generated/`: generated runtime content and cover metadata.
- `content/taxonomy/`: taxonomy source data.
- `lib/content/`: content parsing, processing, runtime access, and cover resolution.
- `lib/i18n/`: locale config, route helpers, messages, and server locale utilities.
- `lib/seo/`: metadata, Open Graph, and structured data helpers.
- `lib/cloudflare/`: image variant and loader utilities.
- `lib/search/`: client search types and index loading.
- `lib/analytics/`: analytics event registry, providers, and dispatch.
- `lib/typography/`: Chinese typography integration and exclusion policy.
- `scripts/content/`: runtime snapshot and search index builders.
- `scripts/ci/`: repository checks and build-output guards.
- `scripts/ai/`: editorial helper CLIs.
- `config/`: operations and typography notes used by the implementation.
- `reports/`: build and AI report output placeholders.
- `tests/`: focused regression tests.

## Requirements

- Node.js `>=20`
- npm
- Cloudflare Wrangler for Worker preview and deployment
- Optional API keys for AI editorial tooling

`next/font` may need network access during production or Cloudflare builds to
fetch Google font metadata.

## Commands

Install dependencies:

```bash
npm install
```

Build generated content artifacts:

```bash
npm run content:build
```

Start local development:

```bash
npm run dev
```

`dev` runs `content:build` first, then starts the Next.js dev server with
Turbopack.

Build and serve the production Next.js output:

```bash
npm run build
npm run start
```

Run the normal validation suite:

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run build
```

Run Cloudflare-compatible build and preview:

```bash
npm run cf:build
npm run cf:preview
```

Deploy manually to Cloudflare:

```bash
npm run cf:deploy
```

Upload a Worker version without immediately deploying it:

```bash
npm run cf:versions:upload
```

## Configuration

Review these files before changing build or deployment behavior:

- `package.json`: scripts and tool entry points.
- `next.config.ts`: Next.js and image settings.
- `open-next.config.ts`: OpenNext Cloudflare adapter settings.
- `wrangler.jsonc`: Cloudflare Worker preview and deployment configuration.
- `eslint.config.js`, `.prettierrc`, `tsconfig.json`: source quality settings.

Runtime and tooling environment variables:

- `NEXT_PUBLIC_ENABLE_HETI`: enable article-scoped Chinese typography enhancement.
- `NEXT_PUBLIC_ENABLE_UMAMI`: enable Umami analytics loading.
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: Umami script URL.
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Umami website identifier.
- `NEXT_PUBLIC_ENABLE_GA`: enable GA4 loading.
- `NEXT_PUBLIC_GA_ID`: GA4 measurement ID.
- `AI_PROVIDER`: `anthropic` or `openai`.
- `ANTHROPIC_API_KEY`: required when `AI_PROVIDER=anthropic`.
- `ANTHROPIC_BASE_URL`: optional Anthropic-compatible API base URL.
- `OPENAI_API_KEY`: required when `AI_PROVIDER=openai`.
- `OPENAI_BASE_URL`: optional OpenAI-compatible API base URL.

## Locale Routing

Supported locales are defined in `lib/i18n/config.ts`:

- `zh-CN`: default locale.
- `en`: English locale.

The site intentionally uses concrete route files under `app/[locale]/` for
localized paths. Do not reintroduce regex rewrites such as
`/:locale(en|zh-CN)` in `next.config.ts`; OpenNext Cloudflare preview has failed
with a Worker `500` on that pattern.

When changing routing, locale detection, navigation, or deployment config, verify
these paths in Cloudflare preview:

- `/`
- `/zh-CN`
- `/en`
- `/zh-CN/about`
- `/en/about`

## Deployment

The repository supports Cloudflare Workers deployment through OpenNext.

Recommended flow:

1. Push to `main`.
2. Let CI run source checks, tests, content linting, and build checks.
3. Let Cloudflare Workers Git integration build and deploy the same commit.
4. Verify `/api/health` and the locale routes listed above.

If deploying from a local machine, run the validation suite before
`npm run cf:deploy`.

## Design Logic

### Build-time content validation

Markdown content is parsed, validated, rendered, and summarized before pages read
it. Invalid frontmatter should fail during content generation or build, not after
deployment.

### Worker-safe runtime data

Cloudflare Workers should not depend on runtime filesystem traversal. The site
generates a runtime JSON snapshot and a search index before development, builds,
and Cloudflare preview/deploy flows.

### Concrete locale routes

Locale-prefixed pages are implemented as real App Router routes so the output is
compatible with OpenNext and Cloudflare Workers.

### Centralized SEO and image policy

Routes should use shared helpers for canonical URLs, metadata, structured data,
and image variants instead of duplicating ad hoc rules.

### Progressive enhancement

Typography, analytics, search, and development tweaks are optional layers. They
should not block core page rendering.

## Usage Examples

### Add a post

Create a Markdown or MDX file under `content/posts/`:

```md
---
title: My Note
description: A short note.
date: 2026-03-27
tags: [notes]
featured: false
draft: false
---

Hello from the content pipeline.
```

Then regenerate content:

```bash
npm run content:build
```

### Add localized page content

Use a locale suffix for English page variants:

```text
content/pages/about.mdx
content/pages/about.en.mdx
```

English content falls back to the default Chinese source when a specific English
variant does not exist.

### Read runtime posts

```ts
import { getRuntimePosts } from '@/lib/content/runtime';

const chinesePosts = getRuntimePosts('zh-CN');
const englishPosts = getRuntimePosts('en');
```

### Read a runtime post by slug

```ts
import { getRuntimePostBySlug } from '@/lib/content/runtime';

const post = getRuntimePostBySlug('blog_v4', 'zh-CN');
```

### Run local search

```ts
import { searchDocuments } from '@/lib/search/client';

const results = await searchDocuments('cloudflare');
```

### Dispatch an analytics event

```ts
import { trackEvent } from '@/lib/analytics/track';

trackEvent('open_search', {
  source: 'header',
});
```

### Run an AI editorial tool

```bash
npm run ai:proofread -- --file content/posts/blog_v4.md
```

Short form:

```bash
npm run ai -- blog_v4.md
```

## Documentation Sync Rule

Keep these files aligned when project facts, commands, routing, deployment, or
agent workflow instructions change:

- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `CLAUDE.md`

Do not add links to documentation files that do not exist in the repository.
