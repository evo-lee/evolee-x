# 实施计划 / Implementation Plan

> **项目**: 个人博客 v4 — Next.js + OpenNext on Cloudflare Workers
> **架构来源**: `blog_v_4_nextjs_open_next_cloudflare_workers.md`
> **日期**: 2026-03-26
>
> **Project**: Personal Blog v4 — Next.js + OpenNext on Cloudflare Workers
> **Architecture source**: `blog_v_4_nextjs_open_next_cloudflare_workers.md`
> **Date**: 2026-03-26

---

## 总览 / Overview

整个项目分为 **11 个阶段**，按依赖顺序排列。每个阶段完成后，项目应处于可部署的状态。阶段之间的并行机会在各阶段的「依赖」字段中标注。

The project is divided into **11 phases** in dependency order. After each phase the project should be in a deployable state. Parallelism opportunities are noted in each phase's "Dependencies" field.

```
Phase 0  ──► Phase 1 ──► Phase 2 ──► Phase 3
                    │                    │
                    ├──► Phase 4 ◄──���────┘
                    │
                    ├──► Phase 8  (search)
                    └──► Phase 9  (AI tooling)

Phase 2 ──► Phase 5 ──► Phase 6
Phase 2 ──► Phase 7  (analytics)
Phase 0 ──► Phase 10 (deploy, start early)
Phase 10 ──► Phase 11 (observability)
```

---

## Phase 0 — 脚手架与配置基线 / Scaffolding & Config Baseline

### 目标 / Goal

建立可编译、可本地运行、可部署到 Cloudflare Workers 的最小项目骨架。这一阶段的产出是所有后续工作的先决条件。

Establish the smallest project skeleton that compiles, runs locally, and can be deployed to Cloudflare Workers. All subsequent phases depend on this phase.

### 交付物 / Deliverables

| 文件 / File | 说明 / Notes |
|---|---|
| `package.json` | 固定依赖版本；脚本包含 `dev`, `build`, `cf:build`, `cf:preview`, `cf:deploy`, `lint:content`, `ai:check` |
| `tsconfig.json` | `strict: true`；路径别名 `@/*` 指向项目根目录 |
| `next.config.ts` | 启用 App Router；配置 Cloudflare 兼容的 image loader；不使用 standalone 输出 |
| `open-next.config.ts` | 使用 `defineCloudflareConfig()`；暂不接入缓存后端 |
| `wrangler.jsonc` | 声明 Worker 名称、`compatibility_date`、`nodejs_compat` flag；开发与生产环境分离 |
| `.gitignore` | 排除 `.open-next/`, `reports/`, `content/.generated/`, `.wrangler/`, `.env*.local` |
| `.env.example` | 列出所有必要的环境变量占位符 |
| `eslint.config.js` + `.prettierrc` | 代码风格统一 |

### 关键依赖包 / Key Dependencies

```json
{
  "next": "^15",
  "@opennextjs/cloudflare": "latest",
  "wrangler": "^3",
  "typescript": "^5",
  "tailwindcss": "^4",
  "zod": "^3",
  "gray-matter": "^4",
  "remark": "^15",
  "remark-gfm": "^4",
  "rehype-slug": "^6",
  "rehype-autolink-headings": "^7",
  "rehype-pretty-code": "^0",
  "shiki": "^1",
  "next-mdx-remote": "^5",
  "heti": "^0",
  "fuse.js": "^7",
  "@anthropic-ai/sdk": "^0",
  "@next/third-parties": "latest",
  "isomorphic-dompurify": "^2",
  "husky": "^9",
  "lint-staged": "^15"
}
```

### 验收标准 / Acceptance Criteria

- [ ] `npm run dev` 启动本地 Next.js dev server，无报错 / starts without errors
- [ ] `npx opennextjs-cloudflare build` 产出 `.open-next/` 目录 / produces `.open-next/`
- [ ] `npx opennextjs-cloudflare preview` 本地 Worker 预览可访问 / local Worker preview accessible
- [ ] TypeScript 编译零错误（`tsc --noEmit`）/ zero TS errors
- [ ] ESLint 零错误 / zero ESLint errors

---

## Phase 1 — 内容层与数据模型 / Content Layer & Data Model

### 目标 / Goal

建立从 Git 仓库读取内容的完整数据管道。所有页面的数据来源都依赖这一层，必须在页面开发之前完成。

Build the complete data pipeline that reads content from the Git repository. All page data flows through this layer — it must be complete before page development.

### 交付物 / Deliverables

**类型定义 / Type definitions**

```
lib/content/types.ts          # Post, Page, Taxonomy, GeneratedMeta 接口
```

**内容加载器 / Content loaders**

```
lib/content/posts.ts          # getAllPosts(), getPostBySlug(), getPostsByTag(), getPostsByCategory()
lib/content/pages.ts          # getPageBySlug()
lib/content/taxonomy.ts       # getAllTags(), getAllCategories(), getTagCounts()
lib/content/index-builder.ts  # 构建搜索索引用的轻量数据快照
```

**Markdown/MDX 处理管道 / Processing pipeline**

```
lib/content/processor.ts      # remark + rehype 管道；代码高亮（shiki）；GFM；slug 锚点
lib/content/frontmatter.ts    # Zod schema 校验 frontmatter；明确报告缺失字段
```

**首图提取 / First-image extraction**

```
lib/content/cover-resolver.ts # cover > 正文第一张图 > 站点默认；构建期执行，结果持久化
```

**Frontmatter Schema（Zod）**

```typescript
// lib/content/frontmatter.ts
const PostSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  author: z.string().optional(),
  canonical: z.string().optional(),
  summary: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  thumbnail: z.string().optional(),
  thumbnailAlt: z.string().optional(),
  imageCredit: z.string().optional(),
  ogImage: z.string().optional(),
});
```

**示例内容 / Sample content**

```
content/posts/hello-world.mdx   # 包含各种排版元素的示例文章
content/pages/about.mdx
content/taxonomy/tags.json      # 标签描述（可选）
```

### 验收标准 / Acceptance Criteria

- [ ] `getAllPosts()` 返回正确排序（日期降序）的文章列表，`draft: true` 的文章在非开发环境中被过滤
- [ ] `getPostBySlug()` 返回含 `html` 字段（已处理的 HTML）和完整 frontmatter 的 Post 对象
- [ ] frontmatter schema 验证失败时，构建报错并指出具体文件和缺失字段
- [ ] `cover-resolver.ts` 能正确按优先级解析封面图，并在 `content/.generated/` 中写入 JSON 旁路文件

---

## Phase 2 — 应用骨架与核心页面 / Application Shell & Core Pages

### 目标 / Goal

实现所有博客路由，完成静态生成配置。这一阶段结束时，站点应可完整浏览（无样式也可接受），并能成功部署到 Cloudflare Workers。

Implement all blog routes and configure static generation. By the end of this phase the site should be fully navigable (unstyled is acceptable) and deployable to Cloudflare Workers.

### 依赖 / Dependencies

Phase 0, Phase 1

### 交付物 / Deliverables

**根布局 / Root layout**

```
app/layout.tsx           # html lang="zh-CN"；字体加载；基础 meta
app/globals.css          # CSS reset；设计变量（颜色、间距、字体）
```

**路由页面 / Route pages**

```
app/(site)/page.tsx                        # 首页：精选文章 + 最近文章
app/(site)/posts/page.tsx                  # 文章列表（分页）
app/(site)/posts/[slug]/page.tsx           # 文章详情；generateStaticParams + generateMetadata
app/(site)/tags/[tag]/page.tsx             # 标签页
app/(site)/categories/[category]/page.tsx  # 分类页
app/(site)/archives/page.tsx               # 按年月归档
app/(site)/about/page.tsx
app/(site)/projects/page.tsx
app/api/health/route.ts                    # 动态路由：健康检查
```

**基础设施页面 / Infrastructure**

```
app/sitemap.ts           # 动态 sitemap
app/robots.ts
app/rss.xml/route.ts     # Content-Type: application/xml
app/not-found.tsx
app/error.tsx            # 'use client' error boundary
app/loading.tsx          # Suspense fallback
```

### 关键实现约束 / Key Implementation Constraints

- 每个内容路由必须导出 `generateStaticParams`，确保完全静态生成
- 每个内容路由必须导出 `generateMetadata`（SEO 基础在此阶段即接入）
- Server Components 优先；`'use client'` 仅用于 `error.tsx` 等必须的场景
- `dangerouslySetInnerHTML` 仅用于构建期生成的可信 HTML；如接入外部内容源，必须通过 `isomorphic-dompurify` 净化

### 验收标准 / Acceptance Criteria

- [ ] `npm run build` 零错误，所有内容路由呈现为静态输出
- [ ] `npx opennextjs-cloudflare preview` 下所有页面可访问
- [ ] `/api/health` 返回 200 JSON
- [ ] `/rss.xml` 返回合法 XML，Content-Type 正确
- [ ] `/sitemap.xml` 包含所有已发布文章的 URL

---

## Phase 3 — SEO 系统 / SEO System

### 目标 / Goal

为所有页面生成完整的、确定性的 SEO 元数据。元数据必须在构建期解析，不依赖运行时生成。

Generate complete, deterministic SEO metadata for all pages. Metadata must be resolved at build time, not at request time.

### 依赖 / Dependencies

Phase 1, Phase 2

### 交付物 / Deliverables

```
lib/seo/metadata.ts       # buildPostMetadata(), buildPageMetadata(), buildSiteMetadata()
lib/seo/structured-data.ts # JSON-LD: BlogPosting, BreadcrumbList, WebSite
lib/seo/og.ts             # Open Graph 标签生成
lib/seo/constants.ts      # 站点名、默认 OG 图、baseURL 等常量
```

**元数据层级 / Metadata cascade**

1. 显式 `seoTitle` / `seoDescription` frontmatter 字段（最高优先级）
2. 文章 `title` / `description`
3. 站点默认值

**结构化数据范围 / Structured data scope**

- 文章详情页：`Article` + `BreadcrumbList`
- 首页：`WebSite` + `SearchAction`（预留）
- 所有页面：`Organization` / `Person`（作者信息）

### 验收标准 / Acceptance Criteria

- [ ] 每篇文章页面包含完整的 `<title>`、`<meta name="description">`、OG 标签和 `<link rel="canonical">`
- [ ] 每篇文章页面包含合法的 `BlogPosting` JSON-LD，可通过 Google Rich Results Test
- [ ] 草稿文章的页面携带 `noindex` 指令
- [ ] Sitemap 的 `lastmod` 字段来自 frontmatter `updated` 字段

---

## Phase 4 — 图片分发系统 / Image Delivery System

### 目标 / Goal

建立基于预定义变体的图片分发系统。应用层只消费固定变体，不暴露任意变换��数。

Establish a predefined-variant image delivery system. The application layer consumes fixed variants only — no arbitrary transformation parameters are exposed.

### 依赖 / Dependencies

Phase 1（封面解析逻辑复用 cover-resolver）

### 交付物 / Deliverables

```
lib/cloudflare/images.ts      # getImageUrl(src, variant), VARIANT_CATALOG 常量
lib/cloudflare/loader.ts      # Next.js 自定义 image loader，指向 Cloudflare 变体
components/ui/ArticleImage.tsx # 封�� next/image，自动选择变体
components/ui/CoverImage.tsx   # 封面图组件，含 alt 文本和加载策略
```

**变体目��� / Variant catalog**

| Variant | 用途 / Use | 宽高比 / Aspect |
|---|---|---|
| `thumb-sm` | 紧凑列表卡片 / compact list cards | 16:9 |
| `thumb-md` | 首页精选 / homepage featured | 16:9 |
| `cover-md` | 文章头图（标准）/ article hero standard | 2:1 |
| `cover-lg` | 文章头图（高清）/ article hero hi-DPI | 2:1 |
| `og-cover` | 社交分享 / social sharing | 1200×630 |

**next.config.ts 补充 / next.config.ts addition**

```typescript
images: {
  loader: 'custom',
  loaderFile: './lib/cloudflare/loader.ts',
  // 或使用 remotePatterns 指向 Cloudflare Images 域名
}
```

### 验收标准 / Acceptance Criteria

- [ ] 文章列表页使用 `thumb-md` 变体，文章详情页使用 `cover-md`/`cover-lg`，社交元数据使用 `og-cover`
- [ ] 原始源图 URL 不出现在任何公开渲染的 HTML 中
- [ ] `cover-resolver.ts` 的三级回退（显式 cover > 正文首图 > 站点默认）通过单元测试验证

---

## Phase 5 — UI 组件库 / UI Component Library

### 目标 / Goal

实现博客所需的全部 UI 组件。组件保持小而单一职责，服务端组件优先。

Implement all UI components required by the blog. Components are small, single-responsibility, and server-component-first.

### 依赖 / Dependencies

Phase 2（路由结构已确定）, Phase 4（图片组件）

### 交付物 / Deliverables

**文章相关 / Article**

```
components/article/ArticleCard.tsx        # 列表卡片：标题、摘要、封面、标签、日期
components/article/ArticleHeader.tsx      # 文章头部：标题、作者、日期、分类
components/article/ArticleContent.tsx     # 正文容器（含排版类名挂载点）
components/article/ArticleToc.tsx         # 目录（client，ScrollSpy）
components/article/RelatedPosts.tsx       # 相关文章推荐
components/article/CopyCodeButton.tsx     # 代码块复制按钮（'use client'）
```

**导航与布局 / Navigation & layout**

```
components/layout/Header.tsx              # 顶部导航：logo、菜单、暗色模式切换
components/layout/Footer.tsx
components/layout/Pagination.tsx
```

**分类与标签 / Taxonomy**

```
components/taxonomy/TagList.tsx           # 标签云 / 标签列表
components/taxonomy/CategoryBadge.tsx
```

**通用 / Common**

```
components/ui/ThemeToggle.tsx             # 暗色模式切换（'use client'）
components/ui/SearchTrigger.tsx           # 打开搜索的触发按钮（'use client'）
```

### 验收标准 / Acceptance Criteria

- [ ] 所有内容类组件为 Server Components（无 `'use client'`）
- [ ] `CopyCodeButton`、`ThemeToggle`、`ArticleToc` 正确标记为 `'use client'` 且不影响 SSR 输出
- [ ] 列表页面在无封面图时优雅降级（显示站点默认图）
- [ ] 移动端响应式布局验收通过（375px、768px、1280px 三个断点）

---

## Phase 6 — 中文排版系统 / Chinese Typography System

### 目标 / Goal

为文章阅读页接入 Heti 风格排版增强。增强必须局限于文章容器，不影响导航、代码块、��格等区域。支持 feature flag 快速回退。

Apply Heti-style typography enhancement to article reading pages. Enhancement must be scoped to the article container and must not affect navigation, code blocks, or tables. Support a feature flag for fast rollback.

### 依赖 / Dependencies

Phase 5（`ArticleContent.tsx`）

### 交付物 / Deliverables

```
lib/typography/heti-client.ts            # initHetiForArticle()；幂等；feature flag 控制
lib/typography/excluded-selectors.ts     # 排除选择器常量列表
lib/typography/policy.ts                 # 导出排版规范常量供 lint 和 AI 提示词复用
components/article/ArticleTypography.tsx # 'use client'；useEffect 挂载；返回 null
styles/heti-overrides.css               # 作用域限定在 [data-article-content].heti
config/typography/chinese-typography.md # 排版规范文件（硬规则 / 软规则 / 排除区域）
```

**Feature flag**

```bash
NEXT_PUBLIC_ENABLE_HETI=true
```

**三层边界 / Three-layer boundary**

1. `lib/typography/policy.ts` — 什么是规范（供 lint 和 AI 引用）
2. `ArticleTypography.tsx` — 客户端初始化入口
3. `styles/heti-overrides.css` — 纯视觉覆盖，作用域锁定

### 验收标准 / Acceptance Criteria

- [ ] `NEXT_PUBLIC_ENABLE_HETI=false` 时文章页样式无变化，无 JS 报错
- [ ] 代码块、表格、行内代码的字间距和字符语义不受 Heti autoSpacing 影响
- [ ] 暗色模式下文章正文对比度 ≥ 4.5:1（WCAG AA）
- [ ] 移动端（375px）段落行距、标点节奏视觉验收通过

---

## Phase 7 — 分析系统 / Analytics System

### 目标 / Goal

接入 Umami（内容分析）和 Google Analytics 4（获取与转化分析）。两套系统的事件归属通过中央注册表管理，analytics 故障不影响页面渲染。

Integrate Umami (content analytics) and GA4 (acquisition and conversion analytics). Event ownership for both systems is managed through a central registry. Analytics failures must not affect page rendering.

### 依赖 / Dependencies

Phase 2（根布局已存在）

### 交付物 / Deliverables

```
lib/analytics/event-registry.ts    # 事件名、目标系统、category、描述
lib/analytics/providers.ts         # hasUmami(), hasGA4()（具体函数签名，非 Function 类型）
lib/analytics/track.ts             # trackEvent()；从注册表分发；fail-open；开发环境 warn
lib/analytics/route-change-debug.ts # useRouteChangeDebug()；wrapped in <Suspense>
```

**Environment variables**

```bash
NEXT_PUBLIC_UMAMI_SCRIPT_URL=
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_ENABLE_UMAMI=true
NEXT_PUBLIC_ENABLE_GA=true
NEXT_PUBLIC_ENABLE_HETI=true   # (从 Phase 6 延续)
```

**事件归属 / Event ownership**

| Event | Target |
|---|---|
| `toc_click`, `copy_code`, `open_search`, `click_cover`, `read_related_post`, `scroll_depth` | `umami` |
| `outbound_link` | `both` |
| `subscribe`, `generate_lead`, `download_file`, `sign_up` | `ga4` |

### 验收标准 / Acceptance Criteria

- [ ] Umami 和 GA4 各自可通过 feature flag 独立禁用，禁用时无 JS 报错
- [ ] `trackEvent('copy_code')` 在 Umami 不可用时静默降级，不抛出异常
- [ ] SPA 路由切换在两个系统中均正确触发 pageview（本地和 preview 环境实测验证）
- [ ] 两套系统不会同时初始化两次（无重复 pageview）

---

## Phase 8 — 搜索功能 / Search

### 目标 / Goal

实现构建期生成搜索索引、前端按需加载的静态搜索方案。不引入独立搜索后端。

Implement static search: build-time index generation, on-demand client-side loading. No dedicated search backend.

### 依赖 / Dependencies

Phase 1（内容加载器）, Phase 5（`SearchTrigger.tsx`）

### 交付物 / Deliverables

```
scripts/content/build-search-index.ts  # 生成 public/search-index.json
lib/search/types.ts                    # SearchDocument, SearchResult 接口
lib/search/client.ts                   # 加载索引 + Fuse.js 搜索；单例模式；懒加载
components/search/SearchModal.tsx      # 搜索弹窗（'use client'）；Cmd+K 快捷键
components/search/SearchResults.tsx    # 结果列表
```

**搜索索引字段 / Index fields**

```typescript
interface SearchDocument {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category?: string;
  date: string;
  summary?: string;
}
```

**构建集成 / Build integration**

在 `package.json` 的 `build` 脚本中，`next build` 之前先运行 `build-search-index`：

```json
"build": "tsx scripts/content/build-search-index.ts && next build"
```

### 验收标准 / Acceptance Criteria

- [ ] `public/search-index.json` 在每次构建时自动更新
- [ ] 搜索���窗仅在用户触发后加载索引（初始页面加载不请求 `search-index.json`）
- [ ] 搜索结果在输入 300ms 后响应（防抖）
- [ ] Cmd+K / Ctrl+K 触发搜索；Esc 关闭

---

## Phase 9 — AI 编辑工具链 / AI Editorial Tooling

### 目标 / Goal

实现在本地和 CI 中运行的 AI 辅助内容审查工具。所有工具以 TypeScript CLI 形式存在，输出 JSON + Markdown 报告，支持 dry-run，不修改源文件。

Implement AI-assisted content review tools that run locally and in CI. All tools are TypeScript CLIs, output JSON + Markdown reports, support dry-run, and never auto-modify source files.

### 依赖 / Dependencies

Phase 1（content types）, Phase 0（`@anthropic-ai/sdk` 已安装）

### 交付物 / Deliverables

**共享基础设施 / Shared infrastructure**

```
scripts/ai/shared/types.ts         # AIReport, AISuggestion, ExecutionMode 接口
scripts/ai/shared/client.ts        # Anthropic 客户端；重试；超时
scripts/ai/shared/schema-validator.ts # Zod 验证模型输出
scripts/ai/shared/file-resolver.ts # 解析 file | glob | changed-files 执行模式
scripts/ai/shared/reporter.ts      # 写 JSON 到 reports/ai/；写 Markdown 摘要
```

**四个 CLI 工具 / Four CLI tools**

```
scripts/ai/proofread.ts            # 校对：拼写、语法、标点风格
scripts/ai/summarize.ts            # 生成/校验 summary 字段建议
scripts/ai/seo-suggest.ts          # 生成 seoTitle、seoDescription 建议
scripts/ai/typography-review.ts    # 排版审查：段落长度、中英混排、标题层级
```

**提示词模板 / Prompt templates**

```
prompts/proofread.md
prompts/summarize.md
prompts/seo-suggest.md
prompts/typography-review.md
```

**执行模式 / Execution modes**

```bash
# 单文件
tsx scripts/ai/proofread.ts --file content/posts/my-post.mdx

# Glob 批量
tsx scripts/ai/proofread.ts --glob "content/posts/*.mdx"

# 仅变更文件（CI 用）
tsx scripts/ai/proofread.ts --changed-files
```

### 验收标准 / Acceptance Criteria

- [ ] 每个 CLI 工具在 `--dry-run` 模式下不写入任何文件
- [ ] 模型输出未通过 Zod schema 验证时，工具退出码非零并报告原因
- [ ] `reports/ai/` 下生成 `.json` + `.md` 两种格式的报告
- [ ] AI 服务不可用时（网络断开），工具退出码非零但不影响站点构建

---

## Phase 10 — 部署流水线 / Deployment Pipeline

### 目标 / Goal

建立可重复的、fail-fast 的 CI/CD 流水线。部署流程与 AI 内容检查流程分离。

Establish a repeatable, fail-fast CI/CD pipeline. The deployment workflow and AI content check workflow are separate.

### 依赖 / Dependencies

Phase 0（配置文件）, Phase 2（可构建的应用）

### 交付物 / Deliverables

**.github/workflows/deploy.yml**

```
触发条件: push to main
步骤:
  1. Checkout
  2. Setup Node + cache
  3. npm ci
  4. 内容 lint（硬性门禁）
  5. tsc --noEmit
  6. next build
  7. opennextjs-cloudflare build
  8. opennextjs-cloudflare deploy (使用 CLOUDFLARE_API_TOKEN)
```

**.github/workflows/ai-content-check.yml**

```
触发条件: pull_request（内容文件变更时）
步骤:
  1. Checkout
  2. Setup Node + cache
  3. npm ci
  4. tsx scripts/ai/proofread.ts --changed-files
  5. tsx scripts/ai/typography-review.ts --changed-files
  6. Upload reports/ as artifact
  7. (可选) Post PR comment summary
注意: AI 步骤失败时降级为 warning，不阻断 PR
```

**环境变量管理 / Environment variable management**

| 变量 / Variable | 存储位置 / Location |
|---|---|
| `CLOUDFLARE_API_TOKEN` | GitHub Actions Secret |
| `ANTHROPIC_API_KEY` | GitHub Actions Secret |
| `NEXT_PUBLIC_*` | GitHub Actions Variable |
| 本地开发 / local dev | `.env.local`（不提交）|

### 验收标准 / Acceptance Criteria

- [ ] `main` 分支的 push 触发完整部署，全流程无需人工干预
- [ ] 内容 lint 失败时部署不继续
- [ ] AI 内容检查报告作为 GitHub Actions artifact 可下载
- [ ] 部署成功后 `https://<worker>.workers.dev/api/health` 返回 200

---

## Phase 11 — 可观测与运维 / Observability & Operations

### 目标 / Goal

建立构建、运行时和部署的可见性基础。运维基线保持轻量但必须显式。

Establish visibility into build, runtime, and deployment states. The operational baseline is lightweight but must be explicit.

### 依赖 / Dependencies

Phase 10（部署已工作）

### 交付物 / Deliverables

**构建报告 / Build reports**

```
scripts/ci/build-report.ts    # 收集页面数量、静态路由列表、构建耗时；写入 reports/build/
```

**运行时监控 / Runtime monitoring**

```
app/api/health/route.ts       # 返回 { status, version, timestamp, env }（已在 Phase 2 建立）
```

**告警配置 / Alert configuration**（文档化，不代码化）

```
config/ops/monitoring.md      # 告警规则文档：
                               #   - 部署失败 → GitHub Actions notification
                               #   - /api/health 连续失败 → Cloudflare Alert
                               #   - 构建时间超过阈值 → 构建报告 flag
```

**操作手册 / Operations runbook**

```
config/ops/runbook.md         # 常见操作：回滚、缓存清理、环境变量更新、bindings 变更
```

### 验收标准 / Acceptance Criteria

- [ ] 每次部署后 `reports/build/` 下有可读的构建摘要
- [ ] `/api/health` 返回当前部署的版本信息（与 `package.json` 版本一致）
- [ ] 部署失败的 GitHub Actions 通知已配置
- [ ] `runbook.md` 覆盖所有 Phase 10 部署产物的常见操作场景

---

## 实施顺序图 / Implementation Sequence

```
Week 1-2   │ Phase 0: Scaffolding
Week 2-3   │ Phase 1: Content Layer
Week 3-4   │ Phase 2: Core Pages        ← 同步: Phase 10 基础部署
Week 4     │ Phase 3: SEO
Week 5     │ Phase 4: Image Delivery    ← 同步: Phase 8 Search index
Week 5-6   │ Phase 5: UI Components
Week 6     │ Phase 6: Typography        ← 同步: Phase 7 Analytics
Week 7     │ Phase 9: AI Tooling
Week 7-8   │ Phase 10: Full CI/CD       ← Phase 11 Observability
```

---

## 全局约束与原则 / Global Constraints

以下约束适用于所有阶段，不重复在各阶段中列出：

These constraints apply to all phases and are not repeated per phase:

1. **TypeScript strict** — `tsconfig.json` 的 `strict: true` 始终开启；禁止使用 `any` 和 `Function` 类型
2. **模块小** — 每个文件单一职责；helper 不超过 150 行
3. **无隐藏全局状态** — 禁止 module-level mutable state；Cloudflare bindings 通过 `getCloudflareContext()` 显式传入
4. **配置走环境变量** — 所有部署相关、密钥相关的值都通过 `process.env` 注入
5. **Dry-run 支持** — 所有 AI 脚本和内容修改脚本必须支持 `--dry-run` 选项
6. **fail-open for enhancements** — 排版增强、analytics、搜索功能出错时静默降级，不影响页面渲染
7. **fail-closed for auth** — 私有资源的访问控制出错时拒绝访问（默认安全）
8. **AI 不在请求路径上** — 任何 AI API 调用只发生在本地 CLI 或 CI 中

---

## 完成定义（引自架构文档）/ Definition of Done (from architecture doc)

> 当开发者能够在 Git 中编写 Markdown 或 MDX 内容，使用 Next.js 静态生成博客页面，通过 OpenNext 将站点部署到 Cloudflare Workers，在本地和 CI 中运行 AI 编辑检查，并同时获得机器可读与人工可读的报告，而且整站在运行时对 AI 服务没有任何依赖时，就可以认为这套架构已经完成落地。
>
> The architecture is considered implemented when a developer can author Markdown or MDX content in Git, statically generate blog pages through Next.js, deploy the site to Cloudflare Workers using OpenNext, run AI editorial checks locally and in CI, review machine-readable and human-readable reports, and operate the site without any runtime dependence on AI services.
