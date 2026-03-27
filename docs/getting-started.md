# Getting Started

English | [简体中文](./getting-started.zh-CN.md)

## What This Project Is

`evolee-x` is a personal blog and content site you can run locally and deploy to Cloudflare Workers.

It is meant for:

- writing posts in Markdown or MDX
- managing a simple personal site without a database
- changing site settings in a few easy files
- deploying through OpenNext

## What You Need

- Node.js `20+`
- npm
- Git
- optional: Cloudflare account for deployment
- optional: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` for AI tooling

## Step-By-Step Quick Start

```bash
git clone <your-repo>
cd evolee-x
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## First Files To Change

- `lib/site.ts`: site title, description, nav, base URL
- `content/posts/*.mdx`: blog posts
- `content/pages/about.mdx`: About page
- `.env.local`: feature flags and analytics settings

## How The AI Tools Work

The AI tools are review helpers, not auto-editors.

When you run an `npm run ai:*` command, the tool:

1. reads the content files you selected
2. reads the matching prompt file
3. sends both to Anthropic
4. asks the model to return JSON only
5. validates the JSON result
6. writes a report into `reports/ai/`

Important:

- AI runs only when you start it manually
- it does not run during `dev`
- it does not directly overwrite your `.md` or `.mdx` files
- it supports both `anthropic` and `openai` provider modes
- both modes support a custom `BASE_URL`

Example:

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
```

Short form:

```bash
npm run ai -- hello-world.mdx
```

## Suggested Beginner Order

1. Run the project locally.
2. Change `lib/site.ts`.
3. Add one post in `content/posts/`.
4. Update `content/pages/about.mdx`.
5. Run `npm run build`.
6. Deploy to Cloudflare later.

## Common Problems

- `node: command not found`
  install Node.js 20+
- `Invalid frontmatter`
  fix missing or malformed fields in Markdown frontmatter
- search not working
  make sure `npm run dev` or `npm run build` completed successfully
- Cloudflare deploy failed
  recheck Cloudflare token, account ID, and local `npm run cf:build`

For the detailed Chinese beginner guide, read [getting-started.zh-CN.md](./getting-started.zh-CN.md).
