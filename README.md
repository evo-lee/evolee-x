# evolee-x

English | [简体中文](./README.zh-CN.md)

## Project Overview

`evolee-x` is a personal blog built with Next.js App Router and OpenNext for Cloudflare Workers. It is designed for writing programming notes, reading reflections, and personal essays while keeping the runtime compatible with edge deployment.

The repository follows a documentation-first layout:

1. Product and setup documentation
2. Architecture and API reference
3. Route and component implementation

## Features

- Markdown/MDX content pipeline with Zod frontmatter validation
- Static route generation for posts, tags, categories, archives, About, and Projects
- Unified SEO system for metadata, Open Graph, Twitter cards, sitemap, robots, RSS, and JSON-LD
- Fixed-variant image delivery pipeline for lists, article covers, inline images, and social sharing
- Cloudflare-friendly runtime snapshot to avoid filesystem traversal in Worker execution

## Typical Use Cases

- Personal technical blog
- Reading notes and essay archive
- Lightweight content site deployed to Cloudflare Workers
- Edge-hosted publishing stack that avoids a database

## Architecture Summary

### Documentation First

- [README.md](./README.md): English project guide
- [README.zh-CN.md](./README.zh-CN.md): Chinese project guide
- [docs/api-reference.md](./docs/api-reference.md): English API reference
- [docs/api-reference.zh-CN.md](./docs/api-reference.zh-CN.md): Chinese API reference
- `docs/phases/`: implementation notes for each completed phase

### Code After Docs

- `app/`: App Router routes, metadata routes, image route, and error/loading pages
- `components/`: site layout, SEO helpers, and image wrappers
- `content/`: Markdown/MDX source files and generated sidecar data
- `lib/content/`: content parsing, validation, runtime snapshot access, taxonomy, and cover resolution
- `lib/seo/`: metadata builders, Open Graph logic, and structured data
- `lib/cloudflare/`: fixed image variants and custom image loader
- `scripts/content/`: build-time content snapshot generation

## Environment Requirements

- Node.js `>= 20`
- npm
- Cloudflare Wrangler for local Worker preview and deployment

## Installation

```bash
npm install
```

## Configuration

This repository currently uses code-based configuration. Review these files before local development:

- `package.json`: scripts and toolchain entry points
- `next.config.ts`: Next.js and custom image loader config
- `open-next.config.ts`: OpenNext Cloudflare adapter config
- `wrangler.jsonc`: local preview and deployment settings

## Development Workflow

```bash
npm run dev
```

Starts Next.js dev mode after generating `content/.generated/runtime-data.json`.

```bash
npm run lint
npm test
npm run type-check
```

Validates lint rules, unit tests, and the full typed production build.

```bash
npm run cf:build
npm run cf:preview
```

Builds and previews the Worker-compatible bundle locally.

## Usage Examples

### Add a New Post

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

### Read Runtime Posts

```ts
import { getRuntimePosts } from '@/lib/content/runtime';

const posts = getRuntimePosts();
```

### Build Post Metadata

```ts
import { buildPostMetadata } from '@/lib/seo/metadata';
import { getRuntimePostBySlug } from '@/lib/content/runtime';

const post = getRuntimePostBySlug('hello-world');
const metadata = post ? buildPostMetadata(post) : null;
```

## Design Notes

- Content is validated at build time, not trusted at render time.
- Worker runtime uses generated JSON snapshots instead of directory reads.
- Public HTML only exposes fixed image variants, not raw source image URLs.
- SEO decisions are centralized in reusable builders instead of route-local ad hoc code.

## Documentation Sync Rule

After every completed phase, update all of the following together:

- `PROGRESS.md`
- `docs/phases/phase-*.md`
- `README.md`
- `README.zh-CN.md`
- `docs/api-reference.md`
- `docs/api-reference.zh-CN.md`

## Code Reference

For detailed function-level parameters, return values, logic notes, error cases, and examples, see:

- [docs/api-reference.md](./docs/api-reference.md)
- [docs/api-reference.zh-CN.md](./docs/api-reference.zh-CN.md)
