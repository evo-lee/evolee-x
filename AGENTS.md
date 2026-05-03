# Repository Guidelines

This file is the shared project guide for coding agents. Keep it aligned with `CLAUDE.md`; tool-specific wording may differ, but project facts and commands should not.

## Project Structure

This repository is a Next.js 15 personal blog targeting Cloudflare Workers through OpenNext.

- `app/(site)/`: canonical unprefixed site routes, including home, posts, projects, and about pages.
- `app/[locale]/`: real locale-prefixed routes for `zh-CN` and `en`. These wrap the canonical pages and are required for Cloudflare/OpenNext compatibility.
- `app/api/health/`, `app/image/[variant]/[token]/route.ts`, `app/rss.xml/route.ts`, `app/robots.ts`, `app/sitemap.ts`: runtime and metadata routes.
- `components/`: site shell, article, search, SEO, and dev-only UI components.
- `content/`: source Markdown/MDX content. Locale variants use suffixes like `about.en.mdx` or `post.zh-CN.md`.
- `content/.generated/`: build-generated runtime snapshots and sidecar data. Do not hand-edit generated output.
- `lib/content/`: frontmatter parsing, Markdown processing, runtime snapshot access, taxonomy, cover resolution, and search index building.
- `lib/i18n/`: locale config, route helpers, messages, and server-side locale extraction.
- `lib/seo/`, `lib/cloudflare/`, `lib/typography/`, `lib/analytics/`: shared runtime support.
- `scripts/content/`: content snapshot and search-index generation.
- `scripts/ci/`: repository checks.
- `scripts/ai/`: advisory AI editorial tools.
- `reports/`: generated reports; keep placeholders tracked, generated output uncommitted unless requested.

## Commands

- `npm install`: install dependencies. Node `>=20` is required.
- `npm run content:build`: rebuild `content/.generated/runtime-data.json` and `public/search-index.json`.
- `npm run dev`: rebuild content, then start Next.js dev server with Turbopack.
- `npm run build`: rebuild content, run production Next.js build, then ensure exported error pages exist.
- `npm run start`: serve the production build locally.
- `npm run type-check`: rebuild content, run `next typegen`, then `tsc --noEmit`.
- `npm run lint`: run ESLint.
- `npm test`: run Node built-in tests through `tsx`.
- `npm run lint:content`: run the content linter.
- `npm run cf:build`: build the Cloudflare Worker bundle with OpenNext.
- `npm run cf:preview`: build and run the Worker locally through Wrangler.
- `npm run cf:deploy`: build and deploy through OpenNext Cloudflare.

Use `npm run lint && npm run type-check && npm run build` for normal validation. For route, locale, Worker, or deployment behavior, also run `npm run cf:preview` and verify the affected paths in the preview server.

## Architecture Notes

`npm run dev`, `npm run build`, and Cloudflare builds all run the content pipeline first:

1. `scripts/content/build-runtime-data.ts` reads content files, validates frontmatter, renders Markdown, and writes `content/.generated/runtime-data.json`.
2. `scripts/content/build-search-index.ts` writes the public search index.

Runtime content access goes through `lib/content/runtime.ts`; Cloudflare Workers must not depend on filesystem traversal at request time.

Locale behavior is route-based. `/zh-CN/*` and `/en/*` are implemented as real Next routes under `app/[locale]/`, not `next.config.ts` rewrites and not middleware. OpenNext/Cloudflare preview previously returned 500 for regex-style rewrites such as `/:locale(en|zh-CN)`, so do not reintroduce that approach. Locale-prefixed pages pass `__locale` internally to the canonical page components. Missing English content falls back to `zh-CN`.

The unprefixed routes under `app/(site)/` remain valid and default to `zh-CN`. They are also reused by the locale wrappers to avoid duplicating page logic.

Images use `lib/cloudflare/loader.ts` and `app/image/[variant]/[token]/route.ts`. Do not expose raw originals unless the image pipeline is deliberately changed.

## Coding Style

Use TypeScript and 2-space indentation. Prettier enforces single quotes, semicolons, trailing commas where configured, and `printWidth: 100`. ESLint extends Next.js rules.

Name React components in `PascalCase`, functions and variables in `camelCase`, and route folders using Next.js conventions such as `app/[locale]/posts/[slug]/page.tsx`. Prefer server components unless client behavior is required.

When adding internal links that should preserve language, use the existing localized link helpers/components instead of hard-coded locale prefixes.

## Testing Guidelines

Use the existing validation stack before shipping material changes:

- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm test` when touching tested logic or content utilities
- `npm run cf:preview` when touching routing, locale behavior, Cloudflare/OpenNext config, Worker-only APIs, or deployment behavior

For locale changes, verify at least `/`, `/zh-CN`, `/en`, `/zh-CN/about`, and `/en/about` in Cloudflare preview.

## Commit & Pull Request Guidelines

Keep commits short, specific, and scoped to one change. Imperative summaries such as `Fix locale routes for Cloudflare` are preferred.

PRs should include:

- a short description of the change and why it was made
- linked issues or phase docs when relevant
- screenshots for UI changes
- validation commands run locally, including Cloudflare preview when relevant

## Repository Notes

Do not rely on old docs that describe `lib/i18n/detect.ts`, request-header locale detection, or locale regex rewrites. Current locale routing is implemented by real files in `app/[locale]/`.
