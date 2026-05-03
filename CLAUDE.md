# CLAUDE.md

This file guides Claude Code when working in this repository. Keep it aligned with `AGENTS.md`; this file may include Claude-specific phrasing, but project facts and commands should match.

## Commands

```bash
# Local development: rebuild runtime snapshot + search index, then start Next.js with Turbopack
npm run dev

# Production build: rebuild content, build Next.js, then ensure exported error pages
npm run build

# Cloudflare Workers build / preview / deploy
npm run cf:build
npm run cf:preview
npm run cf:deploy

# Lint, type-check, tests
npm run lint
npm run type-check
npm test

# Content lint
npm run lint:content

# Format
npx prettier --write .

# AI editorial tools, advisory only
npm run ai:proofread -- --file content/posts/my-post.md
npm run ai:summarize
npm run ai:seo-suggest
npm run ai:typography-review
```

Use `npm run lint && npm run type-check && npm run build` as the normal validation suite. If the change touches routing, locale behavior, OpenNext, Cloudflare config, Worker behavior, or deployment paths, also run `npm run cf:preview` and verify affected URLs through Wrangler.

## Project Structure

- `app/(site)/`: canonical unprefixed site routes. These default to `zh-CN`.
- `app/[locale]/`: real locale-prefixed routes for `zh-CN` and `en`. These are required for Cloudflare/OpenNext compatibility and wrap the canonical pages.
- `app/api/health/`: health endpoint.
- `app/image/[variant]/[token]/route.ts`: Cloudflare-style image delivery route.
- `app/rss.xml/route.ts`, `app/robots.ts`, `app/sitemap.ts`: metadata routes.
- `components/`: article, site shell, search, SEO, analytics, and dev-only UI components.
- `content/`: Markdown/MDX source content. Localized files use suffixes such as `about.en.mdx` and `post.zh-CN.md`.
- `content/.generated/`: generated runtime data; do not hand-edit.
- `lib/content/`: content loading, processing, runtime snapshot access, taxonomy, cover resolution, and search index logic.
- `lib/i18n/`: locale config, messages, route helpers, and server-side locale extraction.
- `lib/seo/`, `lib/cloudflare/`, `lib/typography/`, `lib/analytics/`: shared runtime support.
- `scripts/content/`: content snapshot and search-index builders.
- `scripts/ci/`: CI checks and build helpers.
- `scripts/ai/`: advisory AI editorial tools.

## Architecture

### Build-Time Content Pipeline

`npm run dev`, `npm run build`, and Cloudflare builds all regenerate content before rendering:

1. `scripts/content/build-runtime-data.ts` reads all supported content files, validates frontmatter, renders Markdown/MDX, and writes `content/.generated/runtime-data.json`.
2. `scripts/content/build-search-index.ts` writes `public/search-index.json`.

At runtime, including Cloudflare Workers, content access goes through `lib/content/runtime.ts`. Do not add request-time filesystem traversal.

### Locale Routing

The app supports `zh-CN` and `en`.

Current behavior:

- `/` and other unprefixed `app/(site)/` routes default to `zh-CN`.
- `/zh-CN/*` and `/en/*` are real routes under `app/[locale]/`.
- Locale wrapper pages pass `__locale` internally into the canonical page components.
- Content variants are selected by locale suffix, for example `about.en.mdx`.
- Missing English content falls back to `zh-CN`.

Do not implement locale prefixes with `next.config.ts` regex-style rewrites like `/:locale(en|zh-CN)`. OpenNext/Cloudflare preview returned 500 for that rewrite parser path. Do not reintroduce request-header locale detection docs unless the code is actually changed.

When modifying locale behavior, verify at least:

```bash
npm run cf:preview
# then check:
# /
# /zh-CN
# /en
# /zh-CN/about
# /en/about
```

### Rendering Model

The app uses App Router server components by default. Some routes are dynamic because locale is passed through search params or runtime content access. The locale-prefixed routes are statically enumerated with `generateStaticParams` where applicable.

### Image Delivery

Images go through `lib/cloudflare/loader.ts` and `app/image/[variant]/[token]/route.ts`. The cover resolution order is explicit frontmatter cover, first body image, then default cover. Avoid exposing raw originals unless intentionally changing the image pipeline.

### Chinese Typography

`heti` CSS and `lib/typography/` apply CJK typography enhancement only inside `.heti` reading containers. Code blocks, tables, navigation, and non-article UI should remain excluded.

### AI Editorial Tooling

Scripts in `scripts/ai/` use `@anthropic-ai/sdk` and write structured reports under `reports/ai/`. AI suggestions are advisory and should not be auto-applied to content or frontmatter without explicit user intent.

## Key Config Files

- `next.config.ts`: custom image loader and output tracing root. Do not use locale regex rewrites here.
- `open-next.config.ts`: OpenNext Cloudflare adapter config.
- `wrangler.jsonc`: Worker entrypoint, assets binding, compatibility flags, and local preview port.
- `lib/site.ts`: site metadata and nav ids.
- `lib/i18n/config.ts`: supported locales and default locale.
- `lib/i18n/messages.ts`: localized UI messages.
- `lib/i18n/routes.ts`: locale prefix helpers.

## Frontmatter Schema

```yaml
title, description, date, updated, tags[], category, draft, featured,
author, canonical, summary, seoTitle, seoDescription, cover, coverAlt,
thumbnail, thumbnailAlt, imageCredit, ogImage
```

Author-supplied fields and generated sidecar data under `content/.generated/` must remain separate.

## Validation Expectations

Run the narrowest meaningful validation for the change, but do not skip Cloudflare preview for Worker routing issues. Existing `<img>` LCP warnings in article/post card components are known and unrelated to locale routing.
