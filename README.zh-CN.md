# evolee-x

[English](./README.md) | 简体中文

## 项目整体说明

`evolee-x` 是一个基于 Next.js App Router 与 OpenNext 的个人博客项目，目标是把编程笔记、读书记录和人生感悟发布到 Cloudflare Workers 上，同时保持内容层、SEO 和图片分发链路可维护、可扩展。

这个仓库采用“文档在前，代码在后”的阅读顺序：

1. 先看项目说明与使用方式
2. 再看架构与 API 文档
3. 最后进入路由、组件和底层实现

## 功能介绍

- 基于 Markdown/MDX 的内容系统，frontmatter 使用 Zod 校验
- 文章、标签、分类、归档、About、Projects 等静态路由
- 统一 SEO 系统：metadata、Open Graph、Twitter、RSS、sitemap、robots、JSON-LD
- 固定变体图片分发：列表图、头图、正文图、社交图统一走同一套规则
- 为 Cloudflare Workers 准备的运行时快照，避免运行时遍历文件系统

## 适用场景

- 个人技术博客
- 编程学习与读书笔记站点
- 轻量内容型网站
- 不依赖数据库、优先静态生成的边缘部署项目

## 项目结构

### 文档区

- [README.md](./README.md)：英文项目说明
- [README.zh-CN.md](./README.zh-CN.md)：中文项目说明
- [docs/api-reference.md](./docs/api-reference.md)：英文 API 参考
- [docs/api-reference.zh-CN.md](./docs/api-reference.zh-CN.md)：中文 API 参考
- `docs/phases/`：每个已完成阶段的实现记录

### 代码区

- `app/`：App Router 页面、metadata 路由、图片路由、错误与加载态
- `components/`：站点布局、SEO 组件、图片包装组件
- `content/`：Markdown/MDX 内容与生成后的旁路数据
- `lib/content/`：内容解析、frontmatter 校验、分类聚合、封面解析、运行时快照读取
- `lib/seo/`：SEO metadata、Open Graph、结构化数据
- `lib/cloudflare/`：图片变体与自定义 image loader
- `scripts/content/`：构建期内容快照脚本

## 环境依赖

- Node.js `>= 20`
- npm
- Cloudflare Wrangler

## 安装配置

```bash
npm install
```

开发前建议优先检查这些配置文件：

- `package.json`
- `next.config.ts`
- `open-next.config.ts`
- `wrangler.jsonc`

## 运行步骤

```bash
npm run dev
```

先生成 `content/.generated/runtime-data.json`，再启动本地开发服务。

```bash
npm run lint
npm test
npm run type-check
```

分别执行代码规范检查、单元测试和完整类型构建校验。

```bash
npm run cf:build
npm run cf:preview
```

用于构建并预览 Cloudflare Workers 兼容产物。

## 使用示例

### 新增文章

新建 `content/posts/my-note.mdx`：

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

### 读取运行时文章列表

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

## 关键设计思路

- 内容在构建期校验，不把非法 frontmatter 留到运行时
- Worker 运行时只读快照 JSON，不直接扫描目录
- 公开 HTML 只暴露固定图片变体，不暴露原始源图地址
- SEO 决策集中在 builder 中，避免散落在页面组件里

## 文档同步规则

以后每完成一个 phase，都要同步更新：

- `PROGRESS.md`
- `docs/phases/phase-*.md`
- `README.md`
- `README.zh-CN.md`
- `docs/api-reference.md`
- `docs/api-reference.zh-CN.md`

## 进一步阅读

核心函数的入参、出参、逻辑说明、异常情况和调用示例见：

- [docs/api-reference.md](./docs/api-reference.md)
- [docs/api-reference.zh-CN.md](./docs/api-reference.zh-CN.md)
