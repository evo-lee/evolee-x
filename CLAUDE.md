# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in the planning/scaffolding phase. The architecture document `blog_v_4_nextjs_open_next_cloudflare_workers.md` is the current source of truth for all design decisions. No application code exists yet. Implementation should strictly follow that document.

## Commands

Once scaffolded, the standard commands will be:

```bash
# Local development (standard Next.js dev server)
npm run dev

# Build for production (Next.js build)
npm run build

# Build for Cloudflare Workers (OpenNext transform)
npx opennextjs-cloudflare build

# Local preview of the Worker build
npx opennextjs-cloudflare preview

# Deploy to Cloudflare Workers
npx opennextjs-cloudflare deploy
```

Use the OpenNext CLI (`opennextjs-cloudflare`) as the primary deployment workflow, not raw `wrangler` commands, unless the OpenNext docs explicitly require it.

## Architecture

### Five-Layer Model

1. **Content layer** — Markdown/MDX files in `content/` with frontmatter metadata, stored in Git
2. **Application layer** — Next.js App Router in `app/`, static generation by default
3. **AI editorial layer** — TypeScript CLIs in `scripts/ai/`, runs locally or in CI only, never in the request path
4. **Deployment layer** — `@opennextjs/cloudflare` adapter transforms Next.js build output for Cloudflare Workers
5. **Observability layer** — build reports, runtime logs, analytics

### Repository Structure (Target)

```
app/
  (site)/
    page.tsx, posts/, tags/, categories/, archives/, about/, projects/
  api/health/route.ts
  sitemap.ts, robots.ts, rss.xml/route.ts
  layout.tsx, globals.css
content/
  posts/, pages/, taxonomy/, .generated/
components/
lib/
  content/, seo/, cloudflare/, utils/
prompts/
scripts/
  ai/, content/, ci/
reports/
  ai/, build/
public/
next.config.ts
open-next.config.ts       # OpenNext Cloudflare adapter config
wrangler.jsonc            # Cloudflare Worker bindings and deployment metadata
```

### Key Architectural Decisions

**Rendering**: Static generation for all content pages (homepage, posts, tags, categories, archives, about, projects). Dynamic rendering only for health checks, optional search APIs, and analytics endpoints.

**Content model**: Frontmatter is the primary source of publication metadata. AI-generated suggestions go to `content/.generated/` as sidecar files until a human approves them — never auto-written back to frontmatter.

**Cloudflare bindings**: Accessed via `getCloudflareContext()` from the OpenNext adapter. Used only for optional capabilities (incremental cache via R2/KV, image storage, analytics). Not hidden global dependencies.

**AI tooling**: All AI scripts are TypeScript CLIs outputting structured JSON first, Markdown summaries second, with schema validation before writing reports. Must support file, glob, and changed-files execution modes. Deterministic lint runs as a hard CI gate; AI checks are soft/advisory.

**Image delivery**: All article images delivered through predefined Cloudflare-managed variants (`thumb-sm`, `thumb-md`, `cover-md`, `cover-lg`, `og-cover`). Never expose raw originals on listing surfaces. Cover resolution order: explicit `cover` frontmatter → first body image → site default.

**Chinese typography**: Heti-inspired typography scoped only to article reading containers (`.heti` or equivalent). Never applied globally. `autoSpacing()` initialized client-side only. Code blocks, tables, navigation excluded from typography mutation.

### Frontmatter Schema

```yaml
title, description, date, updated, tags[], category, draft, featured,
author, canonical, summary, seoTitle, seoDescription, cover, coverAlt,
thumbnail, thumbnailAlt, imageCredit, ogImage
```

Author-supplied fields and build-generated fields (`content/.generated/`) must remain separate.
