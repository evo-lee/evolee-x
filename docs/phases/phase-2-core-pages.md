# Phase 2 — 应用骨架与核心页面 / Application Shell & Core Pages

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅ · `npm run cf:build` ✅ · `cf:preview` 首页/健康检查/RSS/Sitemap ✅

---

## 概述 / Overview

Phase 2 的目标不是做“漂亮首页”，而是把站点从内容层推进到真正可浏览的应用骨架。所有核心路由、基础元数据、错误边界、feed 和 sitemap 都在这一阶段接上。

The goal of Phase 2 is not just to make a nicer homepage. It turns the content layer into a navigable application shell by wiring core routes, metadata, boundaries, RSS, and sitemap into the App Router.

这一阶段完成后，站点已经具备完整浏览路径：首页、文章列表、文章详情、标签、分类、归档、About、Projects，以及基础运维路由。

After this phase, the site is fully navigable through the homepage, post list, post detail, tags, categories, archives, About, Projects, and operational routes.

---

## 创建的文件 / Files Created

```
evolee-x/
├── app/
│   ├── (site)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── posts/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── tags/[tag]/page.tsx
│   │   ├── categories/[category]/page.tsx
│   │   ├── archives/page.tsx
│   │   ├── about/page.tsx
│   │   └── projects/page.tsx
│   ├── api/health/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── rss.xml/route.ts
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
├── components/site/
│   ├── SiteLayout.tsx
│   ├── PostList.tsx
│   └── RichContent.tsx
├── lib/
│   ├── site.ts
│   └── format.ts
├── lib/content/
│   └── runtime.ts
└── scripts/content/
    └── build-runtime-data.ts
```

---

## 逐文件讲解 / File-by-File Explanation

### `app/layout.tsx` 与 `app/globals.css` — 根布局与全局样式

根布局现在不再只是占位。它定义了站点级 metadata、`metadataBase` 和中文语言环境。全局样式则建立了浅色/深色双主题、排版节奏、列表视图、文章阅读面和基础站点壳层。

The root layout now defines actual site metadata and language settings. Global CSS establishes light/dark theming, editorial spacing, list-first browsing, and the shared shell used by all content routes.

设计上遵循 `.impeccable.md` 的方向：极简、理性、温暖，不用营销式 hero，也避免卡片泛滥。

---

### `app/(site)/layout.tsx` 与 `components/site/SiteLayout.tsx` — 站点壳层

这一层统一提供：

- 顶部导航
- 内容容器
- 页脚说明

这样每个内容页只负责自己的正文，不再重复写站点框架。

This layer keeps navigation, container rhythm, and footer structure consistent across the whole site.

---

### 内容页路由 / Content Routes

核心页面已经全部接到内容层：

- `app/(site)/page.tsx`：首页，展示 featured 和 recent posts
- `app/(site)/posts/page.tsx`：全部文章列表
- `app/(site)/posts/[slug]/page.tsx`：文章详情，包含 `generateStaticParams` 和 `generateMetadata`
- `app/(site)/tags/[tag]/page.tsx`：标签页
- `app/(site)/categories/[category]/page.tsx`：分类页
- `app/(site)/archives/page.tsx`：按月归档
- `app/(site)/about/page.tsx`：读取 `content/pages/about.mdx`
- `app/(site)/projects/page.tsx`：先落最小可用占位页

这些页面全部优先使用 Server Components，并在动态内容路由上补了静态参数生成。

---

### `components/site/PostList.tsx` 与 `components/site/RichContent.tsx` — 最小页面基元

Phase 2 没有进入完整 UI 组件库阶段，所以这里只抽取最必要的两个基元：

- `PostList.tsx`：列表式文章展示
- `RichContent.tsx`：文章正文 + 目录

这让页面结构保持清晰，也避免在真正进入 Phase 5 之前过早设计一套庞杂组件系统。

---

### `app/api/health/route.ts`、`app/rss.xml/route.ts`、`app/sitemap.ts`、`app/robots.ts`

这一批文件解决的是“站点是否像一个真正可部署站点那样工作”：

- `/api/health` 提供健康检查 JSON
- `/rss.xml` 输出 RSS feed
- `/sitemap.xml` 输出 URL 清单
- `/robots.txt` 指向 sitemap

本地 Cloudflare 预览已经验证这些路由可访问，其中 `/api/health` 返回 200 JSON，`/rss.xml` 和 `/sitemap.xml` 都返回有效 XML。

---

### `app/not-found.tsx`、`app/error.tsx`、`app/loading.tsx` — 基础边界

这三个文件把最基础的应用边界补齐了：

- 404 页面
- 全局错误边界
- Suspense loading fallback

这样 Phase 2 的站点即使还很轻，也已经具备完整应用壳层应有的最低韧性。

---

### `scripts/content/build-runtime-data.ts` 与 `lib/content/runtime.ts` — Worker 兼容层

这是这一阶段里最关键的工程修正。

内容层原始 loader 使用文件系统读取 Markdown，这在 Next 构建期没有问题，但 Cloudflare Worker 运行时不能调用 `fs.readdir`。为了解决这个问题，新增了一层构建期快照：

1. `build-runtime-data.ts` 在构建前把文章、页面、taxonomy 聚合成 `content/.generated/runtime-data.json`
2. `lib/content/runtime.ts` 在运行时只读取这份 JSON，而不再碰文件系统

这让内容驱动页面既保持静态生成能力，又能在 Cloudflare 预览和 Worker 运行时正常工作。

This build-time snapshot is what made the App Router routes Worker-compatible without abandoning the Git-first content model.

---

## 当前结果 / Current Outcome

完成 Phase 2 后，项目已经具备这些能力：

- 所有核心浏览路由可访问
- 动态内容路由具备静态参数生成
- 首页、文章列表、文章详情、标签、分类、归档都已接到真实内容
- 健康检查、RSS、sitemap、robots 已接入
- Cloudflare OpenNext 构建与本地预览链路可工作

这意味着项目已经从“内容层准备完毕”进入“真正可浏览的博客应用骨架”阶段。

---

## 下一步 / Next Step

下一阶段应进入 Phase 3，为这些页面补完整 SEO 系统：

- 提取站点级 SEO 常量
- 为文章页和列表页补更细的 metadata builder
- 增加结构化数据（JSON-LD）
- 补 Open Graph 逻辑

Phase 3 should now build deterministic SEO on top of the route structure delivered here.
