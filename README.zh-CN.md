# evolee-x

[English](./README.md) | 简体中文

## 项目整体说明

`evolee-x` 是一个基于 Next.js 15 App Router 和 OpenNext for Cloudflare Workers
的个人内容站点。它面向随笔、技术文章、读书笔记、项目页和长页面，同时保持边缘运行兼容、不依赖数据库。

当前实现使用构建期生成的内容产物作为运行时数据源，用真实 locale 路由保证 Cloudflare 兼容，并通过统一 helper 管理 SEO、图片、分析、搜索和中文排版。

## 功能覆盖

- 基于 Markdown/MDX 的内容系统，frontmatter 使用 Zod 校验。
- 运行时内容快照生成到 `content/.generated/runtime-data.json`。
- 客户端搜索索引生成到 `public/search-index.json`。
- `/en` 和 `/zh-CN` 使用 `app/[locale]/` 下的真实路由。
- 不带前缀的 `app/(site)/` 路由使用默认中文 locale。
- 当前页面：首页、文章列表、文章详情、项目页、关于页。
- 内容按 locale 解析，英文内容缺失时回退到中文内容。
- SEO 路由与 helper 覆盖 metadata、JSON-LD、RSS、sitemap、robots。
- Cloudflare 图片路由和自定义图片 loader helper。
- 文章渲染、目录、代码复制按钮、站点骨架和本地化导航。
- 基于生成式搜索索引的搜索栏。
- Umami 和 GA4 分析通过 public feature flag 控制。
- AI 编辑 CLI：校对、摘要、SEO 建议、排版审查。
- `/api/health` 健康检查。

## 项目结构

- `app/(site)/`：不带 locale 前缀的站点路由，默认使用 `zh-CN`。
- `app/[locale]/`：`/en` 和 `/zh-CN` 的具体本地化路由。
- `app/api/health/route.ts`：健康检查接口。
- `app/image/[variant]/[token]/route.ts`：公开图片路由。
- `app/rss.xml/route.ts`、`app/robots.ts`、`app/sitemap.ts`：metadata 路由。
- `components/`：文章、站点骨架、分析、SEO、开发辅助组件。
- `content/posts/`：文章源内容。
- `content/pages/`：页面源内容，例如 `about.mdx` 和 `about.en.mdx`。
- `content/.generated/`：生成后的运行时内容和封面元数据。
- `content/taxonomy/`：分类法源数据。
- `lib/content/`：内容解析、处理、运行时访问和封面解析。
- `lib/i18n/`：locale 配置、路由 helper、文案和服务端 locale 工具。
- `lib/seo/`：metadata、Open Graph 和结构化数据 helper。
- `lib/cloudflare/`：图片变体和 loader 工具。
- `lib/search/`：客户端搜索类型和索引加载。
- `lib/analytics/`：分析事件注册表、provider 和事件上报。
- `lib/typography/`：中文排版集成和排除策略。
- `scripts/content/`：运行时快照和搜索索引构建脚本。
- `scripts/ci/`：仓库检查和构建输出保护脚本。
- `scripts/ai/`：AI 编辑辅助 CLI。
- `config/`：运维和排版说明。
- `reports/`：构建和 AI 报告输出占位。
- `tests/`：聚焦的回归测试。

## 环境依赖

- Node.js `>=20`
- npm
- Cloudflare Wrangler，用于 Worker 预览和部署
- 可选：AI 编辑工具需要对应 API key

`next/font` 在生产构建或 Cloudflare 构建时可能需要网络访问，用于获取 Google font metadata。

## 常用命令

安装依赖：

```bash
npm install
```

生成内容产物：

```bash
npm run content:build
```

启动本地开发：

```bash
npm run dev
```

`dev` 会先执行 `content:build`，再启动带 Turbopack 的 Next.js 开发服务。

构建并启动生产版 Next.js 输出：

```bash
npm run build
npm run start
```

执行常规校验：

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run build
```

执行 Cloudflare 兼容构建和预览：

```bash
npm run cf:build
npm run cf:preview
```

手动部署到 Cloudflare：

```bash
npm run cf:deploy
```

只上传 Worker version、不立即部署：

```bash
npm run cf:versions:upload
```

## 配置说明

修改构建或部署行为前，先看这些文件：

- `package.json`：脚本入口和工具链。
- `next.config.ts`：Next.js 和图片设置。
- `open-next.config.ts`：OpenNext Cloudflare 适配设置。
- `wrangler.jsonc`：Cloudflare Worker 预览和部署配置。
- `eslint.config.js`、`.prettierrc`、`tsconfig.json`：源码质量设置。

运行时和工具变量：

- `NEXT_PUBLIC_ENABLE_HETI`：启用文章范围内的中文排版增强。
- `NEXT_PUBLIC_ENABLE_UMAMI`：启用 Umami 分析脚本。
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`：Umami 脚本地址。
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`：Umami 网站 ID。
- `NEXT_PUBLIC_ENABLE_GA`：启用 GA4。
- `NEXT_PUBLIC_GA_ID`：GA4 measurement ID。
- `AI_PROVIDER`：`anthropic` 或 `openai`。
- `ANTHROPIC_API_KEY`：`AI_PROVIDER=anthropic` 时需要。
- `ANTHROPIC_BASE_URL`：可选，Anthropic 兼容接口地址。
- `OPENAI_API_KEY`：`AI_PROVIDER=openai` 时需要。
- `OPENAI_BASE_URL`：可选，OpenAI 兼容接口地址。

## Locale 路由

支持的 locale 定义在 `lib/i18n/config.ts`：

- `zh-CN`：默认 locale。
- `en`：英文 locale。

本项目有意在 `app/[locale]/` 下使用具体路由文件实现本地化路径。不要在
`next.config.ts` 重新加入 `/:locale(en|zh-CN)` 这种 regex rewrite；OpenNext
Cloudflare 预览曾在这个模式下返回 Worker `500`。

修改路由、locale 检测、导航或部署配置时，需要在 Cloudflare preview 中验证：

- `/`
- `/zh-CN`
- `/en`
- `/zh-CN/about`
- `/en/about`

## 部署

本仓库通过 OpenNext 支持 Cloudflare Workers 部署。

推荐流程：

1. 推送到 `main`。
2. 让 CI 执行源码检查、测试、内容检查和构建检查。
3. 让 Cloudflare Workers Git integration 构建并部署同一个提交。
4. 验证 `/api/health` 和上面列出的 locale 路由。

如果从本机手动部署，先执行常规校验，再运行 `npm run cf:deploy`。

## 设计逻辑

### 构建期内容校验

Markdown 内容在页面读取前完成解析、校验、渲染和摘要提取。非法 frontmatter 应该在内容生成或构建阶段失败，而不是部署后才暴露。

### Worker 安全的运行时数据

Cloudflare Workers 不适合依赖运行时文件系统遍历，所以站点会在开发、构建、Cloudflare 预览和部署前生成运行时 JSON 快照和搜索索引。

### 真实 locale 路由

带 locale 前缀的页面使用真实 App Router 路由实现，保证 OpenNext 和 Cloudflare Workers 输出兼容。

### SEO 与图片策略集中治理

路由应该使用共享 helper 处理 canonical URL、metadata、结构化数据和图片变体，不要在页面里复制临时规则。

### 渐进增强

中文排版、分析、搜索和开发辅助都是可选增强层。它们不应该阻塞核心页面渲染。

## 使用示例

### 新增文章

在 `content/posts/` 下创建 Markdown 或 MDX 文件：

```md
---
title: My Note
description: A short note.
date: 2026-03-27
tags: [notes]
featured: false
draft: false
---

Hello from the content pipeline.
```

然后重新生成内容：

```bash
npm run content:build
```

### 新增本地化页面内容

英文页面变体使用 locale 后缀：

```text
content/pages/about.mdx
content/pages/about.en.mdx
```

如果英文内容不存在，会回退到默认中文内容。

### 读取运行时文章

```ts
import { getRuntimePosts } from '@/lib/content/runtime';

const chinesePosts = getRuntimePosts('zh-CN');
const englishPosts = getRuntimePosts('en');
```

### 按 slug 读取运行时文章

```ts
import { getRuntimePostBySlug } from '@/lib/content/runtime';

const post = getRuntimePostBySlug('blog_v4', 'zh-CN');
```

### 执行本地搜索

```ts
import { searchDocuments } from '@/lib/search/client';

const results = await searchDocuments('cloudflare');
```

### 上报分析事件

```ts
import { trackEvent } from '@/lib/analytics/track';

trackEvent('open_search', {
  source: 'header',
});
```

### 运行 AI 编辑工具

```bash
npm run ai:proofread -- --file content/posts/blog_v4.md
```

简化写法：

```bash
npm run ai -- blog_v4.md
```

## 文档同步规则

当项目事实、命令、路由、部署方式或 agent 工作说明变化时，同步维护：

- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `CLAUDE.md`

不要添加仓库里不存在的文档链接。
