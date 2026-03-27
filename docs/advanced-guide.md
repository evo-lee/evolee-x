# Advanced Guide

English | [简体中文](./advanced-guide.zh-CN.md)

## Project Overview

`evolee-x` is a personal publishing stack built with Next.js App Router and OpenNext for Cloudflare Workers. It is designed for technical writing, reading notes, essays, and long-form pages while keeping the runtime edge-compatible, documentation-first, and easy to extend without a database.

This repository follows a strict reading order:

1. Documentation first
2. Architecture and API reference second
3. Routes, components, and implementation last

## Feature Coverage

- Markdown/MDX content pipeline with Zod-validated frontmatter
- Generated runtime snapshot for Cloudflare Workers without filesystem traversal
- Core pages for posts, tags, categories, archives, About, and Projects
- SEO layer for metadata, Open Graph, Twitter cards, RSS, sitemap, robots, and JSON-LD
- Fixed-variant image delivery for thumbnails, covers, inline assets, and OG images
- Componentized site shell and article rendering flow
- Scoped Chinese typography enhancement behind a feature flag
- Search modal backed by a generated search index and lazy Fuse.js loading
- Dual analytics integration with Umami and GA4 under a unified event layer
- AI editorial tooling for proofreading, summaries, SEO suggestions, and typography review
- GitHub Actions deployment and content-quality workflows
- Health check and build reporting for operations visibility

## Typical Use Cases

- Personal technical blog
- Reading log and essay archive
- Static-first content site on Cloudflare Workers
- Documentation-heavy personal website without a CMS or database

## Documentation Zone

Start here before reading code:

- [README.md](../README.md): beginner-friendly quick start
- [README.zh-CN.md](../README.zh-CN.md): Chinese beginner guide
- [docs/api-reference.md](./api-reference.md): function-level reference and design notes
- [docs/api-reference.zh-CN.md](./api-reference.zh-CN.md): Chinese API reference
- [docs/content-pipeline.md](./content-pipeline.md): content ingestion and runtime snapshot flow
- [docs/search-system.md](./search-system.md): search index and query flow
- [docs/analytics-system.md](./analytics-system.md): analytics ownership and event dispatch
- [docs/ai-tooling.md](./ai-tooling.md): editorial CLI tools
- [docs/operations.md](./operations.md): health checks and build reporting
- [docs/phases/phase-10-deployment.md](./phases/phase-10-deployment.md): deployment workflow details
- [`docs/phases/`](./phases): implementation records for phases 0 to 11
- [PROGRESS.md](../PROGRESS.md): current implementation status

## Code Zone

Read these after the docs:

- `app/`: App Router pages, metadata routes, image route, health endpoint, loading/error boundaries
- `components/`: layout, article, taxonomy, and shared UI components
- `content/`: source Markdown/MDX content and generated sidecar data
- `lib/content/`: frontmatter parsing, Markdown processing, runtime access, taxonomy, cover resolution
- `lib/seo/`: metadata builders, Open Graph helpers, and structured data
- `lib/cloudflare/`: public image route helpers and variant catalog
- `lib/search/`: client-side search index loading and query execution
- `lib/analytics/`: event registry, provider guards, event dispatch
- `lib/typography/`: Heti client integration and exclusion policy
- `scripts/content/`: build-time runtime snapshot and search index generation
- `scripts/ai/`: editorial helper CLIs
- `scripts/ci/`: content linting and build report generation
- `config/`: typography and operations documentation used by the implementation

## Environment Requirements

- Node.js `>= 20`
- npm
- Cloudflare Wrangler for preview and deployment
- Optional: Anthropic API access for AI editorial tooling

## Installation and Configuration

Install dependencies:

```bash
npm install
```

Review these files before local development:

- `package.json`: scripts and tool entry points
- `next.config.ts`: Next.js and image settings
- `open-next.config.ts`: OpenNext Cloudflare adapter settings
- `wrangler.jsonc`: Worker preview and deployment configuration

### Environment Variables

The project is mostly code-configured, but these variables affect runtime behavior:

- `NEXT_PUBLIC_ENABLE_HETI`: enables article-scoped Chinese typography enhancement
- `NEXT_PUBLIC_ENABLE_UMAMI`: enables Umami analytics loading
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: Umami script URL
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Umami website identifier
- `NEXT_PUBLIC_ENABLE_GA`: enables GA4 loading
- `NEXT_PUBLIC_GA_ID`: GA4 measurement ID
- `AI_PROVIDER`: `anthropic` or `openai`
- `ANTHROPIC_API_KEY`: required when `AI_PROVIDER=anthropic`
- `ANTHROPIC_BASE_URL`: optional Anthropic-compatible API base URL
- `OPENAI_API_KEY`: required when `AI_PROVIDER=openai`
- `OPENAI_BASE_URL`: optional OpenAI-compatible API base URL

## Run Steps

### Local development

```bash
npm run dev
```

This command generates:

- `content/.generated/runtime-data.json`
- `public/search-index.json`

Then it starts the Next.js development server with Turbopack.

### Production build

```bash
npm run build
npm run start
```

`build` regenerates content artifacts before the Next.js production build.

### Cloudflare preview

```bash
npm run cf:build
npm run cf:preview
```

Use this path to validate the Worker-compatible output locally.

### Cloudflare deployment

Local manual deployment:

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run cf:build
npm run cf:deploy
```

GitHub Actions deployment:

1. Push to `main`.
2. GitHub Actions runs `.github/workflows/deploy.yml`.
3. The workflow validates content and build output.
4. The workflow deploys with OpenNext to Cloudflare Workers.
5. The workflow checks `/api/health` after deployment.

Required deployment variables:

- GitHub Actions Secrets:
  `CLOUDFLARE_API_TOKEN`
  `CLOUDFLARE_ACCOUNT_ID`
  `ANTHROPIC_API_KEY`
  `OPENAI_API_KEY`
- GitHub Actions Variables:
  `NEXT_PUBLIC_*`
  `AI_PROVIDER`
  `ANTHROPIC_BASE_URL`
  `OPENAI_BASE_URL`

Deployment references:

- [docs/phases/phase-10-deployment.md](./phases/phase-10-deployment.md)
- [config/ops/runbook.md](../config/ops/runbook.md)

## Validation Suite

Use the repository minimum validation set before a PR:

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run build
```

## Core Design Logic

### 1. Build-time validation instead of runtime trust

Markdown content is parsed, validated, rendered, and summarized before it is used by pages. Invalid frontmatter fails early instead of leaking into runtime rendering.

### 2. Snapshot-based runtime for Workers

Cloudflare Workers should not depend on runtime directory traversal. The site therefore generates a runtime JSON snapshot and search index during `dev`, `build`, and preview flows.

### 3. Centralized SEO and image policies

Routes do not build ad hoc metadata or expose raw source images. Metadata builders and image helpers keep canonical, Open Graph, Twitter, and image-variant decisions in one place.

### 4. Progressive enhancement at the edges

Typography enhancement, analytics, and search are all feature-flagged or lazy-loaded so failures do not block page rendering.

### 5. Docs-first maintenance

Every finished phase is expected to update progress tracking, phase notes, README, and API reference together so architecture and implementation stay aligned.

## Usage Examples

### Add a new post

Create `content/posts/my-note.mdx`:

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

### Read runtime posts

```ts
import { getRuntimePosts } from '@/lib/content/runtime';

const posts = getRuntimePosts();
```

### Build post metadata

```ts
import { buildPostMetadata } from '@/lib/seo/metadata';
import { getRuntimePostBySlug } from '@/lib/content/runtime';

const post = getRuntimePostBySlug('hello-world');
const metadata = post ? buildPostMetadata(post) : null;
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
npm run ai:proofread -- --file content/posts/hello-world.mdx
```

## Recommended Reading Order

1. [README.md](../README.md)
2. [docs/phases](./phases)
3. [docs/api-reference.md](./api-reference.md)
4. `lib/content/*`, `lib/seo/*`, `lib/cloudflare/*`
5. `app/*` and `components/*`
6. `scripts/*` and `config/*`

## Documentation Sync Rule

After every completed phase, update all of the following together:

- `PROGRESS.md`
- `docs/phases/phase-*.md`
- `README.md`
- `README.zh-CN.md`
- `docs/api-reference.md`
- `docs/api-reference.zh-CN.md`
