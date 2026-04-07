# Repository Guidelines

## Project Structure & Module Organization

This repository is an early-stage Next.js 15 blog scaffold targeting Cloudflare Workers via OpenNext.

- `app/`: App Router entrypoints and global styles. Current routes live in `app/page.tsx` and `app/layout.tsx`.
- `scripts/ci/`: repository checks such as `scripts/ci/lint-content.ts`.
- `docs/phases/`: implementation notes and phase-specific planning.
- `reports/`: generated build or AI reports; keep placeholders tracked, generated output uncommitted unless requested.
- Root config: `next.config.ts`, `open-next.config.ts`, `wrangler.jsonc`, `eslint.config.js`, `.prettierrc`, `tsconfig.json`.

## Build, Test, and Development Commands

- `npm install`: install dependencies; Node `>=20` is required.
- `npm run dev`: start the local Next.js dev server with Turbopack.
- `npm run build`: run a production Next.js build.
- `npm run start`: serve the production build locally.
- `npm run type-check`: run TypeScript with `--noEmit`.
- `npm run lint`: run Next.js/ESLint checks.
- `npm run lint:content`: run the content linter stub.
- `npm run cf:build` and `npm run cf:preview`: build and preview the Cloudflare worker bundle.

Use `npm run lint && npm run type-check && npm run build` before opening a PR.

## Coding Style & Naming Conventions

Use TypeScript and 2-space indentation. Prettier enforces `singleQuote: true`, semicolons, trailing commas (`es5`), and `printWidth: 100`. ESLint extends `next/core-web-vitals` and `next/typescript`.

Name React components in `PascalCase`, functions and variables in `camelCase`, and route folders with Next.js conventions such as `app/posts/[slug]/page.tsx`. Prefer server components unless client behavior is required.

## Testing Guidelines

There is no dedicated unit or integration test framework yet. For now, treat `lint`, `type-check`, `build`, and Cloudflare preview checks as the minimum validation suite. If you add tests, place them beside the feature or under a clear top-level test directory and use names like `feature-name.test.ts`.

## Commit & Pull Request Guidelines

Git history is minimal (`Initial commit`, `1阶段完成`), so keep commits short, specific, and scoped to one change. Imperative summaries such as `Add Cloudflare preview config` or concise milestone-style messages are both acceptable.

PRs should include:

- a short description of the change and why it was made
- linked issues or phase docs when relevant
- screenshots for UI changes
- notes about validation run locally

## Repository Notes

Some scripts referenced in `package.json` under `scripts/ai/*` are not present yet. Do not document or depend on them in new work unless you add the missing files in the same change.
