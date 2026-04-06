# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development — rebuilds runtime snapshot + search index, then starts Next.js with Turbopack
npm run dev

# Production build — same pre-build steps, then Next.js build + post-build export check
npm run build

# Cloudflare Workers build / preview / deploy (wraps opennextjs-cloudflare)
npm run cf:build
npm run cf:preview
npm run cf:deploy

# Lint & format
npm run lint
npx prettier --write .

# Type check (also runs pre-build scripts first)
npm run type-check

# Tests — Node built-in test runner via tsx, no Jest/Vitest
npm test
# Run a single test file
node --import tsx --test tests/content/cover-resolver.test.ts

# Content lint (CI gate — deterministic, must pass)
npm run lint:content

# AI editorial tools (advisory, not CI gates)
npm run ai:proofread -- --file content/posts/my-post.md
npm run ai:summarize
npm run ai:seo-suggest
npm run ai:typography-review
```

## Architecture

### Build-time content pipeline

`npm run dev` and `npm run build` both run two pre-build scripts before Next.js starts:

1. `scripts/content/build-runtime-data.ts` — reads all `content/posts/**/*.md` and `content/pages/**/*.md`, processes frontmatter + Markdown, and writes a full snapshot to `content/.generated/runtime-data.json`.
2. `scripts/content/build-search-index.ts` — builds a Fuse.js index from the same content and writes it to `content/.generated/search-index.json`.

At runtime (including Cloudflare Workers, where filesystem traversal is unavailable), **all data access goes through `lib/content/runtime.ts`**, which imports the JSON snapshot directly — no filesystem reads happen after build time.

### Locale handling (no i18n routing middleware)

The app supports `zh-CN` and `en`. Locale is detected per-request in `lib/i18n/detect.ts` (Cloudflare `CF-IPCountry` header or `Accept-Language`), not via URL segments or Next.js i18n config. Each content file can have locale variants (e.g. `post.zh-CN.md`, `post.en.md`); `selectLocalizedItems()` in `runtime.ts` picks the best variant per locale, falling back to `zh-CN` then any available variant.

### Rendering model

All `app/(site)/` routes are **statically generated**. Dynamic rendering is limited to `app/api/health/` and analytics endpoints. The `app/(site)/layout.tsx` uses `detectRequestLocale()` (an async server function) to pick the locale for each rendered page.

### Image delivery

All images go through `lib/cloudflare/loader.ts` (custom Next.js image loader). The cover resolution order in `lib/content/cover-resolver.ts`: explicit `cover` frontmatter → first image found in body HTML → site default. Cloudflare image variants used: `thumb-sm`, `thumb-md`, `cover-md`, `cover-lg`, `og-cover`. Never expose raw originals.

### Chinese typography

`heti` CSS + `lib/typography/` applies CJK spacing rules **only inside `.heti` containers** (article bodies). It is initialized client-side only. Code blocks, tables, and navigation are excluded.

### AI editorial tooling

Scripts in `scripts/ai/` use `@anthropic-ai/sdk` and output structured JSON to `reports/ai/` before writing Markdown summaries. AI-generated content suggestions go to `content/.generated/` as sidecar files — never auto-applied to frontmatter. `lint:content` is a hard CI gate; all `ai:*` scripts are soft/advisory.

### Key config files

- `next.config.ts` — custom image loader, `outputFileTracingRoot`
- `open-next.config.ts` — OpenNext Cloudflare adapter config
- `wrangler.jsonc` — Worker bindings (R2, KV, Images) and deployment metadata
- `lib/site.ts` — localized site config (name, nav, baseUrl)
- `lib/i18n/config.ts` — `AppLocale` type, locale list, `normalizeLocale()`

### Frontmatter schema

```yaml
title, description, date, updated, tags[], category, draft, featured,
author, canonical, summary, seoTitle, seoDescription, cover, coverAlt,
thumbnail, thumbnailAlt, imageCredit, ogImage
```

Author-supplied fields and build-generated fields (`content/.generated/`) must remain separate.
