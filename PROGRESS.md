# 项目进度追踪 / Project Progress Tracker

> 每完成一个阶段，在状态列填入 ✅、记录完成日期，并同步更新对应的 `docs/phases/phase-*.md` 学习文档以及中英文项目文档。
> When a phase is complete, mark ✅, record the completion date, and update the matching `docs/phases/phase-*.md` learning document plus the bilingual project documentation.

| 图例 | 含义 |
|---|---|
| ⬜ | 未开始 / Not started |
| 🔄 | 进行中 / In progress |
| ✅ | 已完成 / Completed |

---

## 阶段进度 / Phase Progress

| # | 阶段名称 / Phase Name | 状态 | 完成日期 | 学习文档 |
|---|---|---|---|---|
| 0 | 脚手架与配置基线 / Scaffolding & Config Baseline | ✅ | 2026-03-26 | [查看 / View](docs/phases/phase-0-scaffolding.md) |
| 1 | 内容层与数据模型 / Content Layer & Data Model | ✅ | 2026-03-27 | [查看 / View](docs/phases/phase-1-content-layer.md) |
| 2 | 应用骨架与核心页面 / Application Shell & Core Pages | ✅ | 2026-03-27 | [查看 / View](docs/phases/phase-2-core-pages.md) |
| 3 | SEO 系统 / SEO System | ✅ | 2026-03-27 | [查看 / View](docs/phases/phase-3-seo.md) |
| 4 | 图片分发系统 / Image Delivery System | ✅ | 2026-03-27 | [查看 / View](docs/phases/phase-4-image-delivery.md) |
| 5 | UI 组件库 / UI Component Library | ✅ | 2026-03-27 | [查看 / View](docs/phases/phase-5-ui-components.md) |
| 6 | 中文排版系统 / Chinese Typography System | ✅ | 2026-03-27 | [查看 / View](docs/phases/phase-6-typography.md) |
| 7 | 分析系统 / Analytics System | ⬜ | — | [查看 / View](docs/phases/phase-7-analytics.md) |
| 8 | 搜索功能 / Search | ⬜ | — | [查看 / View](docs/phases/phase-8-search.md) |
| 9 | AI 编辑工具链 / AI Editorial Tooling | ⬜ | — | [查看 / View](docs/phases/phase-9-ai-tooling.md) |
| 10 | 部署流水线 / Deployment Pipeline | ⬜ | — | [查看 / View](docs/phases/phase-10-deployment.md) |
| 11 | 可观测与运维 / Observability & Operations | ⬜ | — | [查看 / View](docs/phases/phase-11-observability.md) |

---

## Phase 0 — 脚手架与配置基线 / Scaffolding & Config Baseline

### 交付物清单 / Deliverable Checklist

- [x] `package.json` — 依赖声明与 npm 脚本
- [x] `tsconfig.json` — TypeScript 严格模式配置
- [x] `next.config.ts` — Next.js 应用配置
- [x] `open-next.config.ts` — OpenNext Cloudflare 适配器配置
- [x] `wrangler.jsonc` — Cloudflare Worker 绑定与部署元数据
- [x] `.gitignore` — 排除构建产物与密钥文件
- [x] `.env.example` — 环境变量占位模板
- [x] `eslint.config.mjs` — 代码质量规则
- [x] `.prettierrc` — 代码格式风格
- [x] `postcss.config.mjs` — Tailwind v4 PostCSS 集成
- [x] `app/layout.tsx` — 根布局占位（Phase 2 完善）
- [x] `app/page.tsx` — 首页占位（Phase 2 完善）
- [x] `app/globals.css` — 全局样式占位（Phase 2/5 完善）
- [x] 目录骨架 — 所有后续阶段所需的文件夹结构

---

## Phase 1 — 内容层与数据模型 / Content Layer & Data Model

### 交付物清单 / Deliverable Checklist

- [x] `lib/content/types.ts`
- [x] `lib/content/frontmatter.ts`
- [x] `lib/content/processor.ts`
- [x] `lib/content/posts.ts`
- [x] `lib/content/pages.ts`
- [x] `lib/content/taxonomy.ts`
- [x] `lib/content/cover-resolver.ts`
- [x] `lib/content/index-builder.ts`
- [x] `lib/content/index.ts`
- [x] `content/posts/hello-world.mdx` (示例内容)
- [x] `content/pages/about.mdx`
- [x] `content/taxonomy/tags.json`
- [x] `content/.generated/` 旁路元数据目录

---

## Phase 2 — 应用骨架与核心页面 / Application Shell & Core Pages

### 交付物清单 / Deliverable Checklist

- [x] `app/layout.tsx` (完整版)
- [x] `app/globals.css` (完整版)
- [x] `app/(site)/layout.tsx`
- [x] `app/(site)/page.tsx`
- [x] `app/(site)/posts/page.tsx`
- [x] `app/(site)/posts/[slug]/page.tsx`
- [x] `app/(site)/tags/[tag]/page.tsx`
- [x] `app/(site)/categories/[category]/page.tsx`
- [x] `app/(site)/archives/page.tsx`
- [x] `app/(site)/about/page.tsx`
- [x] `app/(site)/projects/page.tsx`
- [x] `app/api/health/route.ts`
- [x] `app/sitemap.ts`
- [x] `app/robots.ts`
- [x] `app/rss.xml/route.ts`
- [x] `app/not-found.tsx`
- [x] `app/error.tsx`
- [x] `app/loading.tsx`
- [x] `components/site/SiteLayout.tsx`
- [x] `components/site/PostList.tsx`
- [x] `components/site/RichContent.tsx`
- [x] `lib/site.ts`
- [x] `lib/format.ts`
- [x] `lib/content/runtime.ts`
- [x] `scripts/content/build-runtime-data.ts`

---

## Phase 3 — SEO 系统 / SEO System

### 交付物清单 / Deliverable Checklist

- [x] `lib/seo/constants.ts`
- [x] `lib/seo/metadata.ts`
- [x] `lib/seo/structured-data.ts`
- [x] `lib/seo/og.ts`
- [x] `components/seo/StructuredData.tsx`
- [x] `public/og-default.svg`
- [x] 文章详情页 `generateMetadata` 接入统一 builder
- [x] 首页、列表页、归档页、标签页、分类页、About、Projects 接入 canonical + OG + description
- [x] 文章页输出 `BlogPosting` + `BreadcrumbList` JSON-LD
- [x] 根布局输出 `Person` JSON-LD，首页输出 `WebSite` JSON-LD

---

## Phase 4 — 图片分发系统 / Image Delivery System

### 交付物清单 / Deliverable Checklist

- [x] `lib/cloudflare/images.ts`
- [x] `lib/cloudflare/loader.ts`
- [x] `components/ui/ArticleImage.tsx`
- [x] `components/ui/CoverImage.tsx`
- [x] `app/image/[variant]/[token]/route.ts`
- [x] `public/images/default-cover.svg`
- [x] `public/images/hello-world-cover.svg`
- [x] `public/images/hello-world-inline.svg`
- [x] 文章列表页使用 `thumb-md` 变体
- [x] 文章详情页使用 `cover-lg`，正文图片重写为 `cover-md`
- [x] Open Graph / Twitter / `BlogPosting` 使用 `og-cover`
- [x] 原始源图 URL 不出现在公开渲染的 HTML 中
- [x] `cover-resolver.ts` 三级回退单元测试

---

## Phase 5 — UI 组件库 / UI Component Library

### 交付物清单 / Deliverable Checklist

- [x] `components/article/ArticleCard.tsx`
- [x] `components/article/ArticleHeader.tsx`
- [x] `components/article/ArticleContent.tsx`
- [x] `components/article/ArticleToc.tsx`
- [x] `components/article/RelatedPosts.tsx`
- [x] `components/article/CopyCodeButton.tsx`
- [x] `components/layout/Header.tsx`
- [x] `components/layout/Footer.tsx`
- [x] `components/layout/Pagination.tsx`
- [x] `components/taxonomy/TagList.tsx`
- [x] `components/taxonomy/CategoryBadge.tsx`
- [x] `components/ui/ThemeToggle.tsx`
- [x] `components/ui/SearchTrigger.tsx`

---

## Phase 6 — 中文排版系统 / Chinese Typography System

### 交付物清单 / Deliverable Checklist

- [x] `lib/typography/heti-client.ts`
- [x] `lib/typography/excluded-selectors.ts`
- [x] `lib/typography/policy.ts`
- [x] `components/article/ArticleTypography.tsx`
- [x] `styles/heti-overrides.css`
- [x] `config/typography/chinese-typography.md`

---

## Phase 7 — 分析系统 / Analytics System

### 交付物清单 / Deliverable Checklist

- [ ] `lib/analytics/event-registry.ts`
- [ ] `lib/analytics/providers.ts`
- [ ] `lib/analytics/track.ts`
- [ ] `lib/analytics/route-change-debug.ts`
- [ ] `app/layout.tsx` 接入 Umami + GA4

---

## Phase 8 — 搜索功能 / Search

### 交付物清单 / Deliverable Checklist

- [ ] `scripts/content/build-search-index.ts`
- [ ] `lib/search/types.ts`
- [ ] `lib/search/client.ts`
- [ ] `components/search/SearchModal.tsx`
- [ ] `components/search/SearchResults.tsx`
- [ ] `package.json` build 脚本更新

---

## Phase 9 — AI 编辑工具链 / AI Editorial Tooling

### 交付物清单 / Deliverable Checklist

- [ ] `scripts/ai/shared/types.ts`
- [ ] `scripts/ai/shared/client.ts`
- [ ] `scripts/ai/shared/schema-validator.ts`
- [ ] `scripts/ai/shared/file-resolver.ts`
- [ ] `scripts/ai/shared/reporter.ts`
- [ ] `scripts/ai/proofread.ts`
- [ ] `scripts/ai/summarize.ts`
- [ ] `scripts/ai/seo-suggest.ts`
- [ ] `scripts/ai/typography-review.ts`
- [ ] `prompts/proofread.md`
- [ ] `prompts/summarize.md`
- [ ] `prompts/seo-suggest.md`
- [ ] `prompts/typography-review.md`

---

## Phase 10 — 部署流水线 / Deployment Pipeline

### 交付物清单 / Deliverable Checklist

- [ ] `.github/workflows/deploy.yml`
- [ ] `.github/workflows/ai-content-check.yml`

---

## Phase 11 — 可观测与运维 / Observability & Operations

### 交付物清单 / Deliverable Checklist

- [ ] `scripts/ci/build-report.ts`
- [ ] `config/ops/monitoring.md`
- [ ] `config/ops/runbook.md`
