# luoleiorg-x (罗磊的独立博客)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://luolei.org)
[![Vinext](https://img.shields.io/badge/Vinext-Vite%20+%20Next.js%20API-orange?style=flat-square)](https://github.com/cloudflare/vinext)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🚀 运行在 Cloudflare 边缘节点，基于 **React 19 + Vinext** 构建的极速前沿独立博客。

[English](./README_EN.md) | 简体中文

这是 **[罗磊的独立博客](https://luolei.org)** 的 Vinext 重构版本源码。从传统的静态站点（VitePress）全面拥抱前沿的 Serverless Edge 架构，它不仅是一个博客，更是一个现代边缘计算框架的实践范例。

## 🌟 项目介绍 (Introduction)

本项目基于 Cloudflare 全新发布的 [Vinext](https://github.com/cloudflare/vinext)（运行在 Vite 构建体系下的 Next.js App Router 兼容层）开发。

在这个项目中，我们践行了「让计算离用户尽可能的近」的原则，核心的 SSR 渲染、API 请求调度、图片压缩优化全部托管在 **Cloudflare Workers** 全球边缘网络，实现了极致的首屏加载与动态交互体验。

## ✨ 核心特性 (Features)

*   ⚡️ **极致的边缘部署 (Edge Native)**: 完全抛弃传统的 Node.js 容器。基于 Cloudflare Workers 部署，真正的 Global Serverless。
*   🖥️ **服务端组件直出 (RSC)**: 完美融合 Next.js 的 React Server Components。通过构建期的 Markdown 预编译（`import.meta.glob`），免去了对传统文件系统 IO 的依赖。
*   🚄 **全站边缘缓存 (KV Caching)**: 利用 Cloudflare KV Namespace 构建分布式一致性缓存。Umami 统计接口等高频 API 请求完全由缓存拦截，抗并发压力的同时保障了底层数据库的安全。
*   🖼️ **动态图片优化 (CF Images)**: 内置一套无缝整合 Cloudflare Images API 的管道。利用 Worker 绑定原生下发自适应的 WebP 并在边缘裁剪。
*   🎨 **现代美学设计**: 结合 Tailwind CSS 4 提供极致丝滑的深浅色切换、全局响应式 PWA，以及定制化的原子设计 Tokens。
*   🔍 **原生智能搜索**: Pagefind 全文本地聚合搜索，辅以 API 在线引擎兜底。

## 🏗 架构与数据流向 (Architecture)

> 详细的节点交互、Worker 分发示意图以及边缘隔离区的介绍，请阅读我们专门补充的：
> � **[架构设计大纲与 Mermaid 集成图](./docs/architecture.md)**

简略来说，全应用划分为以下核心体系：
*   **路由解析器 (CF Worker Entry)**: 承接并分发给静态 Asset、Image Optimizer 或是 SSR 渲染引擎。
*   **数据结构同秘钥管理 (Edge Secrets)**: 利用 `wrangler secret` 进行注入。并在本地借助 `.dev.vars` 无感开发。
*   **同构的解析器**: Markdown 与 AST (rehype/remark) 的无侵入动态渲染。

## 🛠 技术栈 (Tech Stack)

*   **框架**: [vinext](https://github.com/cloudflare/vinext) (CF 官方出品), React 19 App Router
*   **语言和样式**: TypeScript 5, Tailwind CSS 4.0
*   **内容流水线**: `gray-matter`, `unified`, `remark`, `rehype` (完全剥离 Node API 依赖)
*   **数据中心**: Umami Analytics (独立私有化部署), Cloudflare KV Namespace

## 🚀 部署与运行 (Deploy & Run)

推荐使用现代包管理器 `pnpm`。

### 1. 本地环境准备

```bash
# 安装项目依赖
pnpm install

# (可选) 复制常规环境变量，并填入开发环境专属变量
cp .env.example .env

# (重要) 对于 Cloudflare 本地调试使用的机密 Token，需另建 .dev.vars (已被 gitignore 排除)
# .dev.vars 文件中写入：
# UMAMI_API_TOKEN=your_token_here
```

### 2. 构建与运行

```bash
# 同步文章并建立搜索索引
pnpm sync:content
pnpm search:index

# 启动包括 Edge 模拟和端口扫描的开发服务器
pnpm dev

# 生产环境预构建
pnpm build
```

### 3. 上线至 Cloudflare

你可以直接在一台有完整环境与 `wrangler` 认证的本地机器上统一部署：

```bash
# 一次性强制写入关键部署秘钥至 Cloudflare
npx wrangler secret put UMAMI_API_TOKEN

# Cloudflare 发布流程
pnpm deploy:vinext
```

我们极度推荐配置 CI / CD。相关 GitHub Action 配置说明请参考常规的 Wrangler Action。

## 📁 目录结构摘要 (Directory Structure)

我们遵循了现代 Next.js / React 结合 Cloudflare 生态的极佳工程化布局，兼顾业务与边缘兼容极具拓展性：

```
├── .dev.vars               # 🔒 本地 Worker 机密数据 (不需提交至 Git 库)
├── wrangler.jsonc          # ☁️ Cloudflare Edge 线上全局无感配置
├── content/posts/          # 📝 Markdown 博客数据源
├── docs/                   # 📚 项目说明文档与架构图
├── src/                    
│   ├── app/                # 🚦 路由、服务端页面与 Metadata
│   ├── components/         # 🧱 通用 UI 组件与插槽
│   ├── lib/                # 🔧 业务抽象：Umami 分析、KV 缓存重构
│   └── styles/             # 🎨 设计系统：Tokens, 布局, 版式样式
├── worker/index.ts         # ⚡️ CF Worker 原生拦截与分发网关
└── packages/search-core/   # 🔎 Monorepo 体系下的搜索支撑
```

## 🔗 相关链接

- **线上演示站点**: [https://luolei.org](https://luolei.org)
- **旧版（VitePress）**: [foru17/luoleiorg](https://github.com/foru17/luoleiorg)
- **Vinext 官方支持**: [cloudflare/vinext](https://github.com/cloudflare/vinext)

## 📝 许可协议 (License)

本项目采用 [MIT License](LICENSE)。

> 📧 关于本项目的问题或建议，欢迎通过 [GitHub Issues](https://github.com/foru17/luoleiorg-x/issues) 交流。
