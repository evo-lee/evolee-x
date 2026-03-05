# luoleiorg-x

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://luolei.org)
[![Vinext](https://img.shields.io/badge/Vinext-Vite%20+%20Next.js%20API-orange?style=flat-square)](https://github.com/cloudflare/vinext)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 运行在 Cloudflare 边缘节点，基于 **React 19 + Vinext** 构建的开源独立博客。

[English](./README_EN.md) | 简体中文

基于 Cloudflare [Vinext](https://github.com/cloudflare/vinext)（Vite 构建体系下的 Next.js App Router 兼容层）开发。SSR 渲染、API 请求、图片优化全部托管在 Cloudflare Workers 全球边缘网络。

## 核心特性

- **边缘部署** — 基于 Cloudflare Workers，全球 Serverless，无 Node.js 容器依赖
- **服务端组件** — React Server Components + 构建期 Markdown 预编译（`import.meta.glob`）
- **边缘缓存** — Cloudflare KV 分布式缓存，高频 API 请求由缓存拦截
- **图片优化** — Cloudflare Images API 自适应 WebP + 边缘裁剪
- **AI 对话** — 首页内置博主 AI 分身，基于 OpenAI 兼容 API 流式对话
- **全文搜索** — Pagefind 本地搜索 + API 在线兜底
- **内容流水线** — AI 自动生成摘要/SEO、推文抓取、图片尺寸预取

## 个性化配置

所有个人信息集中在 `src/lib/site-config.ts` 一个文件中。Fork 后只需修改此文件即可完成个性化：

```typescript
export const siteConfig = {
  title: "你的博客标题",
  siteUrl: "https://yourdomain.com",
  brand: "你的品牌名",
  author: {
    name: "你的名字",
    email: "you@example.com",
    github: "your-github",
    twitterUsername: "your-twitter",
  },
  ai: {
    welcomeText: "自定义欢迎语",
    topics: ["你的", "话题", "列表"],
    placeholders: ["自定义占位文案"],
    // ...
  },
  // ...
};
```

## 目录结构

```
.
├── content/posts/          # Markdown 博客文章（frontmatter + 正文）
├── data/                   # 自动生成的数据文件（AI 摘要、推文缓存等）
├── scripts/                # 构建与内容处理脚本
├── worker/index.ts         # Cloudflare Worker 入口（路由分发）
├── src/
│   ├── app/                # 路由、页面、API Routes
│   ├── components/         # UI 组件
│   ├── lib/
│   │   ├── site-config.ts  # 站点配置（个人信息唯一入口）
│   │   ├── ai/             # AI 任务（摘要、SEO、聊天）
│   │   └── chat-prompts/   # AI 对话 Prompt 模板
│   └── styles/             # Tailwind 设计 Tokens
├── packages/search-core/   # Monorepo 搜索模块
├── wrangler.jsonc          # Cloudflare Workers 配置
└── .env.example            # 环境变量模板
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装与开发

```bash
# 安装依赖
pnpm install

# 复制环境变量模板
cp .env.example .env
# 编辑 .env，填入你的 API Token（参考 .env.example 中的注释）

# 同步文章 + 生成搜索索引 + 启动开发服务器
pnpm sync:content
pnpm dev
```

### 构建与部署

```bash
# 生产构建
pnpm build

# 部署到 Cloudflare Workers
pnpm deploy:vinext

# 预览部署（不影响生产环境）
pnpm deploy:vinext:preview
```

Cloudflare Worker 运行时需要的密钥通过 `wrangler secret` 注入：

```bash
npx wrangler secret put UMAMI_API_TOKEN
```

## 内容管理

### 文章格式

文章存放在 `content/posts/` 目录，使用标准 Markdown + YAML frontmatter：

```markdown
---
title: "文章标题"
date: "2024-01-01"
cover: https://example.com/cover.jpg
categories:
  - code
tags:
  - javascript
  - react
---

正文内容...
```

支持的分类（categories）：`code` / `tech` / `travel` / `lifestyle` / `photography` / `run` / `zuoluotv`

### 从旧版 VitePress 同步文章

如果你有旧版 [VitePress 博客](https://github.com/foru17/luoleiorg) 的本地仓库：

```bash
# 从 ../luoleiorg/docs/ 复制文章和静态资源到当前项目
pnpm sync:content
```

该脚本会将 `../luoleiorg/docs/` 中的 Markdown 文件复制到 `content/posts/`，公共资源复制到 `public/legacy/`。

### 发布新文章的完整流程

```bash
# 1. 在 content/posts/ 下创建 Markdown 文件（文件名即 slug）

# 2. 一键预处理（推荐）—— 自动完成：推文抓取 → AI 摘要/SEO → 搜索索引
pnpm pre-publish

# 或者只处理指定文章
pnpm pre-publish --slug=my-new-article

# 3. 本地预览
pnpm dev

# 4. 部署
pnpm deploy:vinext
```

`pre-publish` 支持的参数：

| 参数 | 说明 |
|------|------|
| `--slug=SLUG` | 只处理指定文章 |
| `--skip-tweets` | 跳过推文抓取 |
| `--skip-ai` | 跳过 AI 处理 |
| `--skip-search` | 跳过搜索索引生成 |
| `--force` | 强制重新处理已缓存的文章 |
| `--dry-run` | 预览模式，不实际执行 |

## 脚本详解

### 搜索索引

```bash
# 生成完整搜索索引（JSON + Pagefind），dev/build 时自动执行
pnpm search:index

# 单独生成 JSON 索引（public/search-index.json）
pnpm search:json

# 单独生成 Pagefind 索引（public/pagefind/）
pnpm search:pagefind
```

### 推文数据

文章中引用的推文（通过 `tweetId="xxx"` 标记）和作者时间线推文会被抓取并缓存到本地 JSON 文件，渲染时直接读取，无需实时调用 Twitter API。

**需要环境变量：** `TWITTER_BEARER_TOKEN`

```bash
# 抓取文章中引用的推文 → data/tweets-cache.json
pnpm fetch:tweets

# 抓取作者时间线推文 → data/author-tweets-cache.json
pnpm fetch:tweets:author

# 指定用户名和数量
pnpm fetch:tweets:author -- --username=luoleiorg --max=300

# 强制全量刷新（忽略增量缓存）
pnpm fetch:tweets:author -- --force
```

### 图片尺寸预取

扫描文章中的图片 URL，请求远程图片获取宽高尺寸，用于防止页面布局偏移（CLS）。结果缓存到 `data/image-dimensions.json`。

```bash
pnpm fetch:images
```

### AI 处理

对文章批量生成 AI 摘要和 SEO 元数据。支持任何 OpenAI 兼容 API（阿里云千问、DeepSeek、OpenAI、Gemini 等）。

**需要环境变量：** `AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL`

```bash
# 处理所有文章（跳过已缓存 + skip list 中的）
pnpm ai:process

# 强制重新处理所有文章
pnpm ai:process -- --force

# 只处理指定文章
pnpm ai:process -- --slug=my-article

# 只跑摘要任务（不跑 SEO）
pnpm ai:process -- --task=summary

# 只处理最近 10 篇文章
pnpm ai:process -- --recent=10

# 只处理没有缓存结果的新文章
pnpm ai:process -- --new-only

# 预览模式
pnpm ai:process -- --dry-run

# 调整并发数（默认 10）
pnpm ai:process -- --concurrency=5

# 清除失败跳过列表后重试
pnpm ai:process -- --clear-skip
```

**生成的数据文件：**

| 文件 | 说明 |
|------|------|
| `data/ai-summaries.json` | 文章摘要、关键要点、标签、阅读时间 |
| `data/ai-seo.json` | SEO 元描述、关键词、OG 描述 |
| `data/ai-skip-list.json` | 处理失败的文章跳过列表 |

### 作者简介生成

用于 About 页面和 AI 对话上下文。分两步：先聚合原始数据，再用 AI 生成结构化简介。

```bash
# 第一步：聚合作者上下文（博客文章 + 推文 + GitHub 简历）
pnpm profile:context
# → data/author-context.json

# 第二步：用 AI 生成简介报告
pnpm profile:generate
# → data/reports/{model-id}.json

# 一键执行以上两步
pnpm profile:all

# 强制重新生成（覆盖已有 AI 报告）
pnpm profile:force

# 不使用 AI，用规则模板生成（离线兜底）
pnpm profile:generate -- --no-ai
```

`profile:context` 会从以下数据源聚合：
- `content/posts/` — 博客文章（结合 Umami 阅读量排序热门文章）
- `data/author-tweets-cache.json` — 作者推文
- GitHub 公开 README / RESUME 文件（自动从 GitHub 拉取）

另有一个旧版一体化脚本（同时生成上下文和报告）：

```bash
pnpm ai:profile           # 使用 AI
pnpm ai:profile -- --no-ai  # 规则模板
```

## 环境变量

复制 `.env.example` 为 `.env` 并填入你的值。以下是各变量的用途说明：

| 变量 | 用途 | 需要场景 |
|------|------|---------|
| `TWITTER_BEARER_TOKEN` | Twitter API v2 | `fetch:tweets` / `fetch:tweets:author` |
| `AI_BASE_URL` | AI API 地址 | `ai:process` / `ai:profile` / 线上对话 |
| `AI_API_KEY` | AI API 密钥 | 同上 |
| `AI_MODEL` | AI 模型名 | 同上 |
| `UMAMI_API_TOKEN` | Umami 统计 API | 线上阅读量展示 / `profile:context` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare 部署 | `deploy:vinext` |
| `GA4_PROPERTY_ID` / `GA4_CLIENT_EMAIL` / `GA4_PRIVATE_KEY` | Google Analytics 4 | 历史阅读量迁移（可选） |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Telegram 推送 | AI 对话监控（可选） |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile | AI 聊天人机验证（可选） |

> **注意：** `AI_*`、`TELEGRAM_*`、`TURNSTILE_*` 变量在 `.env`（本地开发）和 `wrangler.jsonc`（线上 Worker）中需保持同步。

## 技术栈

- **框架：** [vinext](https://github.com/cloudflare/vinext)（Cloudflare 官方），React 19 App Router
- **语言和样式：** TypeScript 5，Tailwind CSS 4
- **内容处理：** gray-matter，unified，remark，rehype
- **搜索：** Pagefind（本地）+ 自建 API
- **数据：** Cloudflare KV，Umami Analytics（自托管）
- **AI：** OpenAI 兼容 API（ai-sdk）

## 相关链接

- **线上站点：** [https://luolei.org](https://luolei.org)
- **旧版（VitePress）：** [foru17/luoleiorg](https://github.com/foru17/luoleiorg)
- **Vinext：** [cloudflare/vinext](https://github.com/cloudflare/vinext)
- **架构设计文档：** [docs/architecture.md](./docs/architecture.md)

## License

[MIT](LICENSE)
