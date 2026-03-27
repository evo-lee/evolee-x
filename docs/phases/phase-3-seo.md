# Phase 3 — SEO 系统 / SEO System

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅ · `npm run cf:build` ✅ · `cf:preview` metadata / JSON-LD / RSS / sitemap 验证 ✅

---

## 概述 / Overview

Phase 3 的任务不是“随手加几条 meta 标签”，而是把站点的 SEO 决策从页面里抽出来，做成一套可复用、可推导、可保持一致的系统。

Phase 3 is about turning SEO from ad hoc route-level metadata into a reusable and deterministic system. The goal is consistency across the whole site, not just adding a few isolated tags.

这一阶段完成后，首页、文章页、列表页、分类页、标签页、About、Projects 都不再手写零散 metadata，而是统一通过 builder 生成 canonical、description、Open Graph 和 robots 策略。

---

## 创建的文件 / Files Created

```
evolee-x/
├── lib/seo/
│   ├── constants.ts         ← 站点级 SEO 常量
│   ├── og.ts                ← Open Graph 生成工具
│   ├── metadata.ts          ← buildSiteMetadata / buildPageMetadata / buildPostMetadata
│   └── structured-data.ts   ← WebSite / BlogPosting / BreadcrumbList / Person
├── components/seo/
│   └── StructuredData.tsx   ← 注入 JSON-LD 的最小组件
└── public/
    └── og-default.svg       ← 默认 Open Graph 图片
```

---

## 逐文件讲解 / File-by-File Explanation

### `lib/seo/constants.ts` — 站点级 SEO 常量

这里集中放站点名、描述、base URL、作者和默认 OG 图。目的很直接：让 SEO 逻辑只有一个可信来源，而不是散落在多个页面里。

This file centralizes the site name, description, base URL, author, and default OG image so every route works from one source of truth.

---

### `lib/seo/og.ts` — Open Graph 规则

这个模块只做一件事：把页面级输入统一整理成 `openGraph` 配置，并处理图片 URL 的回退策略。

当前规则是：

- 优先用显式图片
- 如果是站内相对路径，拼成完整 URL
- 如果没有可用图片，回退到 `/og-default.svg`
- 如果内容层的封面是 data URI，也回退到默认 OG 图，避免把 data URI 暴露成社交卡片图片

---

### `lib/seo/metadata.ts` — Metadata Builder

这是 Phase 3 的核心。

它提供了几类 builder：

- `buildSiteMetadata()`：站点级 metadata
- `buildPageMetadata()`：普通页面和集合页
- `buildPostMetadata()`：文章详情页
- `buildPageContentMetadata()`：从内容页对象生成 metadata

这些 builder 统一负责：

- `<title>`
- `<meta name="description">`
- canonical
- Open Graph
- Twitter card
- robots / noindex

这样 Phase 2 的页面结构保持不变，但 SEO 决策已经从页面组件里抽离出来了。

---

### `lib/seo/structured-data.ts` — JSON-LD

这里生成结构化数据对象，包括：

- `Person`
- `WebSite`
- `CollectionPage`
- `BlogPosting`
- `BreadcrumbList`

实际接入范围是：

- 根布局：`Person`
- 首页：`WebSite`
- 列表页 / 标签页 / 分类页 / 归档页 / Projects / About：`CollectionPage`
- 文章详情页：`BlogPosting` + `BreadcrumbList`

这满足了 implementation plan 里对结构化数据层级的要求，也让后续 Phase 4/5 不需要再碰 SEO 基础设施。

---

### `components/seo/StructuredData.tsx` — JSON-LD 注入

这是一个非常小的 server component，用来稳定输出 `<script type="application/ld+json">`。它把结构化数据从页面 JSX 中解耦出来，避免每个页面重复写 `dangerouslySetInnerHTML`。

---

### `public/og-default.svg` — 默认社交图

在图片分发系统（Phase 4）还没实现之前，需要一个稳定可访问的默认 Open Graph 图。这里用一个轻量 SVG 先把社交卡片基线补齐，等 Phase 4 再切换到更完整的图片策略。

---

## 路由接入 / Route Integration

这一阶段还做了一个重要动作：把 SEO builder 真正接到路由，而不只是停留在库文件。

已接入的页面包括：

- 首页
- 文章列表
- 文章详情
- 标签页
- 分类页
- 归档页
- About
- Projects
- 根布局

文章页 `generateMetadata()` 现在会优先使用：

1. `seoTitle` / `seoDescription`
2. `title` / `description`
3. 站点默认值

同时文章页输出 canonical、OG 标签和 `BlogPosting` JSON-LD。

---

## 当前结果 / Current Outcome

完成 Phase 3 后，项目已经具备这些能力：

- 所有主要内容路由拥有统一 metadata 生成策略
- 文章页包含 canonical、description、Open Graph 和 JSON-LD
- 草稿内容在 metadata builder 里支持 `noindex` 逻辑
- sitemap 的 `lastmod` 继续来自 `updated || date`
- 默认社交图已落地，图片回退行为稳定

本地 Cloudflare 预览已经验证：

- 首页返回 canonical、description、OG 图和多个 JSON-LD script
- `posts/hello-world` 返回 canonical、文章级 OG 标签
- 文章页 JSON-LD 中包含 `BlogPosting` 与 `BreadcrumbList`

---

## 下一步 / Next Step

下一阶段应进入 Phase 4，建立真正的图片分发系统：

- Cloudflare 图片 URL 规则
- 自定义 Next image loader
- 文章头图与列表缩略图组件
- 用可公开访问的变体图片替换当前 Phase 3 的默认 OG 兜底策略

Phase 4 should now take over image delivery so SEO can move from placeholder OG handling to a production image pipeline.
