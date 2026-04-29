# evolee-x

[English](./README.md) | 简体中文

## 项目整体说明

`evolee-x` 是一个基于 Next.js App Router 与 OpenNext 的个人内容站点，目标是把技术文章、读书笔记、随笔和长页面稳定发布到 Cloudflare Workers，同时保持边缘运行兼容、文档优先、架构清晰，并且不依赖数据库。

这个仓库采用严格的阅读顺序：

1. 先看文档
2. 再看架构和 API 说明
3. 最后进入路由、组件和底层实现

## 功能介绍

- 基于 Markdown/MDX 的内容系统，frontmatter 使用 Zod 校验
- 面向 Cloudflare Workers 的运行时快照，避免运行时遍历文件系统
- 文章、标签、分类、归档、About、Projects 等核心页面
- 统一 SEO 层：metadata、Open Graph、Twitter、RSS、sitemap、robots、JSON-LD
- 固定变体图片分发：缩略图、封面图、正文图、OG 图统一治理
- 组件化站点骨架和文章渲染结构
- 受 feature flag 控制的中文排版增强
- 基于生成式搜索索引和懒加载 Fuse.js 的站内搜索
- Umami + GA4 双分析系统，统一事件命名层
- AI 编辑辅助工具：校对、摘要、SEO 建议、排版审查
- GitHub Actions 部署与内容质量检查工作流
- 健康检查与构建报告，方便运维观察

## 适用场景

- 个人技术博客
- 读书笔记与随笔归档站
- 部署在 Cloudflare Workers 上的静态优先内容站
- 不接 CMS、不接数据库的轻量内容发布系统

## 文档分区

建议先读这些文档，再读代码：

- [README.md](./README.md)：英文项目说明、安装、运行、示例
- [README.zh-CN.md](./README.zh-CN.md)：中文项目说明
- [docs/getting-started.zh-CN.md](./docs/getting-started.zh-CN.md)：新手一步一步上手教程
- [docs/api-reference.md](./docs/api-reference.md)：英文 API 和核心逻辑说明
- [docs/api-reference.zh-CN.md](./docs/api-reference.zh-CN.md)：中文 API 参考
- [docs/content-pipeline.md](./docs/content-pipeline.md)：内容接入与运行时快照链路
- [docs/search-system.md](./docs/search-system.md)：搜索索引与查询链路
- [docs/analytics-system.md](./docs/analytics-system.md)：分析事件归属与上报链路
- [docs/ai-tooling.md](./docs/ai-tooling.md)：AI 编辑辅助 CLI
- [docs/operations.md](./docs/operations.md)：健康检查与构建报告
- [docs/phases/phase-10-deployment.md](./docs/phases/phase-10-deployment.md)：部署流水线说明
- [`docs/phases/`](./docs/phases)：Phase 0 到 Phase 11 的实现记录
- [PROGRESS.md](./PROGRESS.md)：当前实现进度

## 代码分区

文档读完后，再看这些目录：

- `app/`：App Router 页面、metadata 路由、图片路由、健康检查、错误与加载边界
- `components/`：布局、文章、分类法和共享 UI 组件
- `content/`：Markdown/MDX 源内容和生成后的旁路数据
- `lib/content/`：frontmatter 解析、Markdown 处理、运行时访问、分类聚合、封面解析
- `lib/seo/`：metadata builder、Open Graph 和结构化数据
- `lib/cloudflare/`：公开图片路由辅助函数与变体目录
- `lib/search/`：客户端搜索索引加载与查询执行
- `lib/analytics/`：事件注册表、provider 守卫、事件上报
- `lib/typography/`：Heti 排版集成与排除规则
- `scripts/content/`：构建期运行时快照和搜索索引生成脚本
- `scripts/ai/`：AI 编辑辅助 CLI
- `scripts/ci/`：内容检查和构建报告脚本
- `config/`：与实现配套的排版和运维文档

## 环境依赖

- Node.js `>= 20`
- npm
- Cloudflare Wrangler
- 可选：Anthropic API 访问能力，用于 AI 编辑工具

## 安装配置

安装依赖：

```bash
npm install
```

本地开发前建议先看这些配置文件：

- `package.json`：脚本入口与工具链
- `next.config.ts`：Next.js 与图片设置
- `open-next.config.ts`：OpenNext Cloudflare 适配设置
- `wrangler.jsonc`：Worker 预览与部署配置

### 环境变量

项目主体以代码配置为主，但以下变量会影响运行行为：

- `NEXT_PUBLIC_ENABLE_HETI`：控制文章中文排版增强
- `NEXT_PUBLIC_ENABLE_UMAMI`：控制 Umami 是否启用
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`：Umami 脚本地址
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`：Umami 站点 ID
- `NEXT_PUBLIC_ENABLE_GA`：控制 GA4 是否启用
- `NEXT_PUBLIC_GA_ID`：GA4 Measurement ID
- `AI_PROVIDER`：`anthropic` 或 `openai`
- `ANTHROPIC_API_KEY`：当 `AI_PROVIDER=anthropic` 时需要
- `ANTHROPIC_BASE_URL`：可选，Anthropic 兼容接口地址
- `OPENAI_API_KEY`：当 `AI_PROVIDER=openai` 时需要
- `OPENAI_BASE_URL`：可选，OpenAI 兼容接口地址

## 运行步骤

### 本地开发

```bash
npm run dev
```

该命令会先生成：

- `content/.generated/runtime-data.json`
- `public/search-index.json`

然后再启动带 Turbopack 的 Next.js 开发服务。

### 生产构建

```bash
npm run build
npm run start
```

`build` 会在正式构建前重新生成内容产物。

### Cloudflare 预览

```bash
npm run cf:build
npm run cf:preview
```

用于本地验证 Worker 兼容产物。

### Cloudflare 部署

本地手动部署：

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run cf:build
npm run cf:deploy
```

GitHub Actions 自动部署：

1. 推送代码到 `main`
2. GitHub Actions 触发 `.github/workflows/deploy.yml`
3. workflow 先校验内容和构建结果
4. 再通过 OpenNext 部署到 Cloudflare Workers
5. 部署后访问 `/api/health` 做健康检查

部署所需变量：

- GitHub Actions Secrets：
  `CLOUDFLARE_API_TOKEN`
  `CLOUDFLARE_ACCOUNT_ID`
  `ANTHROPIC_API_KEY`
  `OPENAI_API_KEY`
- GitHub Actions Variables：
  `NEXT_PUBLIC_*`
  `AI_PROVIDER`
  `ANTHROPIC_BASE_URL`
  `OPENAI_BASE_URL`

部署参考文档：

- [docs/phases/phase-10-deployment.md](./docs/phases/phase-10-deployment.md)
- [config/ops/runbook.md](./config/ops/runbook.md)

## 校验步骤

提交前至少执行这组校验：

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run build
```

## 关键代码逻辑设计思路解析

### 1. 构建期校验，运行时不信任内容

Markdown 内容在进入页面渲染前就完成 frontmatter 校验、正文处理、摘要提取和封面解析。非法内容尽早失败，不把问题留到运行时。

### 2. 用快照替代 Worker 运行时目录扫描

Cloudflare Workers 不适合依赖本地文件系统遍历，所以站点在 `dev`、`build` 和预览前都会生成运行时 JSON 快照和搜索索引。

### 3. SEO 与图片策略集中治理

页面路由不直接拼 metadata，也不直接暴露原始图片地址。统一通过 builder 和图片辅助函数收口，避免规则漂移。

### 4. 增强能力采用渐进式接入

中文排版、分析脚本和搜索都做了 feature flag 或懒加载处理。即使初始化失败，也不应阻塞页面渲染。

### 5. 文档优先维护

每个 phase 完成后，需要同步更新进度文档、阶段文档、README 和 API 参考，保证设计说明和实现状态一致。

## 使用示例 & 调用演示

### 新增文章

创建 `content/posts/my-note.mdx`：

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

### 读取运行时文章

```ts
import { getRuntimePosts } from '@/lib/content/runtime';

const posts = getRuntimePosts();
```

### 生成文章 SEO Metadata

```ts
import { buildPostMetadata } from '@/lib/seo/metadata';
import { getRuntimePostBySlug } from '@/lib/content/runtime';

const post = getRuntimePostBySlug('hello-world');
const metadata = post ? buildPostMetadata(post) : null;
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
npm run ai:proofread -- --file content/posts/hello-world.mdx
```

简化写法：

```bash
npm run ai -- hello-world.mdx
```

## 推荐阅读顺序

1. [README.zh-CN.md](./README.zh-CN.md)
2. [docs/phases](./docs/phases)
3. [docs/api-reference.zh-CN.md](./docs/api-reference.zh-CN.md)
4. `lib/content/*`、`lib/seo/*`、`lib/cloudflare/*`
5. `app/*` 与 `components/*`
6. `scripts/*` 与 `config/*`

## 文档同步规则

以后每完成一个 phase，都要同步更新：

- `PROGRESS.md`
- `docs/phases/phase-*.md`
- `README.md`
- `README.zh-CN.md`
- `docs/api-reference.md`
- `docs/api-reference.zh-CN.md`

