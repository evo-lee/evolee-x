# Phase 1 — 内容层与数据模型 / Content Layer & Data Model

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 1 的目标是把“占位站点”推进到“有真实内容来源的站点骨架”。这一阶段不追求完整页面，而是先建立一套可复用、可验证、可扩展的内容读取管线。

The goal of Phase 1 is to move the project from a placeholder site to a site with a real content source. This phase does not focus on finished pages yet. It establishes a reusable, validated, and extensible content pipeline first.

内容层一旦稳定，Phase 2 的首页、文章页、标签页和分类页就都可以直接消费统一的数据接口。

Once the content layer is stable, Phase 2 can build the homepage, post pages, tag pages, and category pages directly on top of a shared data interface.

---

## 创建的文件 / Files Created

```
evolee-x/
├── content/
│   ├── posts/
│   │   └── hello-world.mdx         ← 示例文章
│   ├── pages/
│   │   └── about.mdx               ← 示例独立页面
│   ├── taxonomy/
│   │   └── tags.json               ← 标签描述元数据
│   └── .generated/
│       └── .gitkeep                ← 旁路元数据目录
└── lib/content/
    ├── types.ts                    ← Post / Page / SearchIndex 类型
    ├── files.ts                    ← 路径与文件枚举工具
    ├── frontmatter.ts              ← Zod schema 与 frontmatter 解析
    ├── processor.ts                ← MDX 处理、HTML/文本/标题提取
    ├── posts.ts                    ← 文章加载器
    ├── pages.ts                    ← 页面加载器
    ├── taxonomy.ts                 ← 标签、分类与计数聚合
    ├── cover-resolver.ts           ← 封面图解析与旁路文件输出
    ├── index-builder.ts            ← 搜索快照构建
    └── index.ts                    ← 内容层统一导出
```

---

## 逐文件讲解 / File-by-File Explanation

### `lib/content/types.ts` — 内容层契约

这里定义了 `Post`、`PostSummary`、`Page`、`Heading`、`CoverResolution` 和 `SearchIndexEntry`。这一步的意义不是“补类型”，而是先固定后续阶段要依赖的数据形状。

This file defines the content-layer contract. It fixes the shapes that later phases will depend on instead of letting each page invent its own ad hoc structure.

---

### `lib/content/frontmatter.ts` — Frontmatter 验证

这里使用 `gray-matter` 读取 frontmatter，使用 `zod` 做 schema 校验。文章和独立页面分开建模，文章 schema 更完整，页面 schema 更轻量。

This file uses `gray-matter` to parse frontmatter and `zod` to validate it. Posts and standalone pages are modeled separately: posts have a richer schema, pages use a smaller one.

关键点：

- 缺字段或字段类型错误会直接抛出带文件路径的错误
- `tags`、`draft`、`featured` 等字段会被规范化为稳定返回值
- 这让后续页面层不需要再到处写 defensive code

---

### `lib/content/processor.ts` — MDX 处理管线

这里用 `next-mdx-remote/rsc` 编译 MDX，并接入：

- `remark-gfm` 处理表格、任务列表等 GFM 语法
- `rehype-slug` 给标题生成锚点
- `rehype-autolink-headings` 给标题自动插入链接
- `rehype-pretty-code` 做代码高亮

输出结果不是只有 HTML，还包括：

- `html`
- `text`
- `excerpt`
- `headings`

这一步非常关键，因为后面的目录、摘要、搜索和 SEO 都会依赖这些衍生字段。

---

### `lib/content/posts.ts` 与 `lib/content/pages.ts` — 内容加载器

这两个文件负责把磁盘上的 `content/posts/*.mdx` 和 `content/pages/*.mdx` 变成统一的数据对象。

目前已经支持：

- `getAllPosts()`
- `getPostBySlug(slug)`
- `getPostsByTag(tag)`
- `getPostsByCategory(category)`
- `getAllPages()`
- `getPageBySlug(slug)`

它们还会在非开发环境中过滤 `draft: true` 的内容。

---

### `lib/content/taxonomy.ts` — 分类聚合

这个模块从文章集合中聚合出：

- 全部标签
- 全部分类
- 标签计数
- `content/taxonomy/tags.json` 中的标签描述

这能让 Phase 2 和 Phase 3 直接消费统一的 taxonomy 数据，而不是在页面里临时扫描文章。

---

### `lib/content/cover-resolver.ts` — 封面策略

封面图解析遵循一个明确优先级：

`frontmatter.cover` → 正文第一张图片 → 默认 SVG 占位封面

解析后的结果会写入 `content/.generated/covers/*.json`。这样 AI 建议、SEO、首页卡片、Open Graph 图策略都可以共享同一份决策结果。

---

### `lib/content/index-builder.ts` — 搜索快照

这个文件负责把文章信息压缩成轻量搜索索引，并写入 `content/.generated/search-index.json`。当前站点还没有搜索 UI，但 Phase 8 已经能直接复用这一层。

This file builds a lightweight search snapshot and writes it to `content/.generated/search-index.json`. The site does not expose search UI yet, but Phase 8 can build on this immediately.

---

### 示例内容 / Sample Content

`content/posts/hello-world.mdx` 用来覆盖标题、列表、图片、表格和代码块等常见内容类型。`content/pages/about.mdx` 用来验证独立页面的较轻 frontmatter 模型。`content/taxonomy/tags.json` 提供标签说明的最小样例。

The sample files are intentionally small but representative. They validate the pipeline without introducing unnecessary design or page complexity too early.

---

## 当前结果 / Current Outcome

完成 Phase 1 后，仓库已经具备这些能力：

- 从 Git 仓库读取文章与独立页面
- 校验 frontmatter，发现错误时直接报到具体文件
- 把 MDX 转成结构化输出，而不只是原始字符串
- 生成摘要、标题目录、纯文本和搜索快照
- 统一解析封面图，并把结果写入旁路元数据目录

这意味着项目已经不再只是“页面占位脚手架”，而是拥有了真正的内容数据层。

---

## 下一步 / Next Step

下一阶段应进入 Phase 2，把 `app/` 里的占位页面替换为真实路由：

- 首页读取 `getAllPosts()`
- 文章详情页读取 `getPostBySlug()`
- 标签页、分类页、About 页读取对应 loader
- 为内容路由补齐 `generateStaticParams`

Phase 2 should now replace placeholder routes with real pages powered by the content loaders introduced here.
