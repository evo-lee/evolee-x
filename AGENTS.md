# AGENTS.md

Guidance for coding agents working on this blog project.

## Scope and Priorities

1. Follow this file for repo-specific workflows and conventions.
2. Follow direct user instructions over this file when they conflict.
3. Keep changes minimal, targeted, and consistent with existing code.
4. **Always** check `/docs` directory for task-specific documentation.

## Repository Overview

This is a **personal blog** ([luolei.org](https://luolei.org)) built with:

- **Framework**: Vinext (Next.js API on Vite) + React 19
- **Deployment**: Cloudflare Workers Edge
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS 4 + shadcn/ui components

### Key Directories

```
├── content/posts/          # Markdown blog posts
├── src/
│   ├── app/               # Next.js App Router (pages, API routes)
│   ├── components/        # React components (TweetCard, ArticleCard, etc.)
│   ├── lib/content/       # Content parsing, markdown rendering
│   └── styles/            # CSS tokens, layouts
├── scripts/               # Build/utility scripts
├── docs/                  # Task documentation and specs
├── data/                  # Runtime data (tweets-cache.json)
└── public/                # Static assets, search index
```

## Environment and Toolchain

- **Node.js**: 20+ (LTS recommended)
- **TypeScript**: Strict mode enabled
- **Module System**: ESM (`"type": "module"` in package.json)

## Install and Bootstrap

```bash
# Install dependencies
pnpm install

# Sync content from old repo (if needed)
pnpm sync:content

# Generate search indexes
pnpm search:index

# Start dev server
pnpm dev
```

## Build and Deploy Commands

### Development

```bash
pnpm dev              # Start dev server with port detection
pnpm dev:vinext:raw   # Direct vinext dev (no port detection)
```

### Build

```bash
pnpm build            # Build for production
pnpm build:vinext     # Alias for pnpm build
```

### Type Check and Lint

```bash
pnpm typecheck        # TypeScript check (tsc --noEmit)
pnpm lint             # ESLint check
```

### Deploy

```bash
# Requires CLOUDFLARE_API_TOKEN in .env
source .env && pnpm deploy:vinext

# Dry run (preview without actual deploy)
pnpm deploy:vinext:dry
```

## Content Management

### Markdown Posts

- Location: `content/posts/*.md`
- Format: YAML frontmatter + Markdown body

```yaml
---
title: "Post Title"
date: "2024-03-19"
categories: [tech, lifestyle]
cover: https://example.com/image.jpg
---
```

### Tweet Cards

Use simplified syntax (auto-fetches from cache):

```markdown
<TweetCard tweetId="1770112626657247620" />
```

**Not** the verbose version with manual attributes.

To update tweet cache:

```bash
source .env && pnpm fetch:tweets
```

See `/docs/tweet-card-system.md` for details.

### Search Index

```bash
pnpm search:index     # Generate all indexes
pnpm search:json      # JSON index only
pnpm search:pagefind  # Pagefind index only
```

## Code Style Guidelines

### TypeScript

- Prefer explicit types on exported APIs
- Use `import type` for type-only imports
- Avoid `any`; use `unknown` with type guards if needed
- Strict null checks enabled

### React Components

- Use `"use client"` only when necessary (client-side hydration)
- Components: PascalCase filenames
- Hooks: `useXxx` naming
- Props interfaces: `XxxProps`

### Styling

- Tailwind CSS v4 with CSS-first configuration
- Semantic class prefixes:
  - `site-*` for layout components
  - `article-*` for content components
- Dark mode: `dark:` prefix

### Imports Order

1. React/Next.js built-ins
2. Third-party packages
3. Internal aliases (`@/components`, `@/lib`)
4. Relative imports (avoid if possible)

## API and Data Fetching

### Server-Side (React Server Components)

```typescript
import { getPostBySlug } from "@/lib/content/posts";

const post = await getPostBySlug(slug);
```

### Client-Side

```typescript
"use client";
import useSWR from "swr";

const { data } = useSWR('/api/analytics/hits', fetcher);
```

### API Routes

Location: `src/app/api/*/route.ts`

- Use Edge Runtime (default in Vinext)
- Keep handlers lightweight
- Cache responses when appropriate

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:

| Variable | Purpose | When Needed |
|----------|---------|-------------|
| `TWITTER_BEARER_TOKEN` | Fetch tweet data | Running `pnpm fetch:tweets` |
| `CLOUDFLARE_API_TOKEN` | Deploy to Workers | Running `pnpm deploy:vinext` |

Load before commands:

```bash
source .env && pnpm fetch:tweets
source .env && pnpm deploy:vinext
```

## Documentation Structure

Task and feature documentation lives in `/docs`:

```
docs/
├── README.md              # Documentation index
├── TWEET_CARD_USAGE.md    # TweetCard system guide
└── [task-name].md         # Feature/task specs
```

**When working on a feature:**
1. Check `/docs` for existing specs
2. Create/update docs for complex tasks
3. Link related files in documentation

## Testing Expectations

Before submitting changes:

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (or has acceptable warnings)
- [ ] `pnpm build` succeeds
- [ ] Visual check in dev mode (if UI changes)

## Common Tasks

### Add a New Component

1. Create in `src/components/component-name.tsx`
2. Export from component file
3. Use kebab-case filenames
4. Add to appropriate page/layout

### Modify Article Styling

- Global article styles: `src/styles/article.css`
- Component-specific: use Tailwind classes
- Markdown elements: scoped under `.article-content`

### Update Site Configuration

- Site metadata: `src/lib/site-config.ts`
- Social links, analytics ID, etc.

### Add API Route

1. Create `src/app/api/route-name/route.ts`
2. Export `GET`, `POST`, etc. handlers
3. Use `NextResponse.json()` for responses

## Performance Considerations

- Use `React.cache()` for data fetching
- Lazy load images with `loading="lazy"`
- Use `next/script` with `strategy="lazyOnload"` for analytics
- Keep API routes lightweight (Edge Runtime)

## Security Notes

- `.env` is gitignored (never commit secrets)
- API tokens have limited scopes
- No sensitive data in client-side code

## Troubleshooting

### Build fails

1. Check `pnpm typecheck` output
2. Verify `data/tweets-cache.json` exists (run `pnpm fetch:tweets` if missing)
3. Clear `.next/` and `dist/` directories

### Tweet cards not rendering

1. Ensure `data/tweets-cache.json` has the tweet data
2. Check tweetId matches exactly
3. Verify `content-enhancer.tsx` is included in layout

### Deploy fails

1. Verify `CLOUDFLARE_API_TOKEN` is set
2. Check token has Workers deployment permissions
3. Try dry run: `pnpm deploy:vinext:dry`

## Agent Working Notes

- Prefer minimal, surgical edits
- Match existing file style (quotes, formatting)
- Update relevant docs in `/docs` for significant changes
- Test in dev mode before considering complete
