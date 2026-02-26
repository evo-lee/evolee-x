# luoleiorg-x

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://luolei.org)
[![Vinext](https://img.shields.io/badge/Vinext-Vite%20+%20Next.js%20API-orange?style=flat-square)](https://github.com/cloudflare/vinext)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🚀 基于 **React 19 + vinext**（Vite 上的 Next.js API 兼容层）的 [luolei.org](https://luolei.org) 博客项目。

这是 [罗磊的独立博客](https://luolei.org) 的 vinext 版本源码。

**迁移路径**: VitePress → Next.js 16 → **Vinext**，部署于 Cloudflare Workers Edge。

**背景**: 这是 Cloudflare 发布 Vinext 后的早期实践项目。框架太新，部署踩了一些坑但整体顺利。全程 AI 辅助完成。

## ✨ Features

- ⚡ **Edge 部署** - 基于 Cloudflare Workers，全球边缘节点加速
- 🎨 **深色模式** - 原生支持亮色/暗色主题切换
- 📱 **PWA 支持** - 可安装为桌面/移动应用
- 🔍 **智能搜索** - Pagefind 本地检索 + API 搜索兜底
- 📊 **浏览量统计** - 基于 Google Analytics 的实时访问统计
- 🗂️ **分类导航** - 多维度文章分类与标签
- 📰 **RSS/Sitemap** - 完整的 SEO 与订阅支持
- 🤖 **AI 预留** - 预留 AI 总结、AI 搜索 API 扩展位

## 🛠 Tech Stack

- **[vinext](https://github.com/cloudflare/vinext)** - Cloudflare 官方，Vite + Next.js API，部署到 Workers
- **React 19** - 最新 React 特性
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 原子化 CSS
- **gray-matter + unified/remark/rehype** - Markdown 处理流水线

## 📁 Directory Structure

```
├── content/posts/          # Markdown 文章源
├── packages/search-core/   # Monorepo 共享搜索核心
├── src/
│   ├── app/               # 路由、页面、metadata
│   ├── components/        # 主题组件
│   ├── lib/content/       # 内容加载、解析、渲染
│   └── styles/            # 样式分层（tokens/layout/article）
├── scripts/               # 内容同步、索引生成
└── public/                # 静态资源、搜索索引
```

## 🚀 Quick Start

```bash
# 安装依赖
pnpm i

# 同步文章内容（从旧仓库）
pnpm sync:content

# 生成搜索索引
pnpm search:index

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 部署到 Cloudflare Workers
pnpm deploy:vinext
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | 启动开发服务器（含端口探测） |
| `pnpm build` | 生产构建 |
| `pnpm sync:content` | 从旧仓库同步 markdown |
| `pnpm search:index` | 生成所有搜索索引 |
| `pnpm search:json` | 生成 JSON 搜索索引 |
| `pnpm search:pagefind` | 生成 Pagefind 索引 |
| `pnpm lint` | ESLint 检查 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm deploy:vinext` | 部署到 Cloudflare Workers |
| `pnpm deploy:vinext:dry` | 部署预览（不实际部署） |

## 🏗 Architecture

### Style Architecture

- `src/styles/tokens.css` - 设计变量、字体、主题色
- `src/styles/layout.css` - 站点布局（header/footer/nav）
- `src/styles/article.css` - 文章排版、markdown 样式

### Naming Conventions

- 使用语义化前缀：`site-*`、`article-*`
- Markdown 样式统一在 `article-content` 作用域内

## 🔗 Related

- **新版线上地址**: [https://luolei.org](https://luolei.org)
- **旧版线上地址**: [https://v.luolei.org](https://v.luolei.org)
- **旧版（VitePress）**: [foru17/luoleiorg](https://github.com/foru17/luoleiorg)
- **Vinext**: [cloudflare/vinext](https://github.com/cloudflare/vinext)

## 📝 License

MIT © [罗磊](https://luolei.org)

---

> 📧 关于本项目的问题或建议，欢迎通过 [GitHub Issues](https://github.com/foru17/luoleiorg-x/issues) 交流。

## Migration from VitePress

本项目从 [VitePress 版本](https://github.com/foru17/luoleiorg) 迁移而来：

| 维度 | VitePress 旧版 | Vinext 新版 |
|------|----------------|-------------|
| 构建工具 | VitePress | vinext (Vite + Next.js API) |
| 部署平台 | GitHub Pages | Cloudflare Workers |
| 路由 | 文件路由 | App Router |
| 搜索 | Algolia DocSearch | Pagefind + 自建 API |
| 图片 | 静态引用 | 远程优化 |
| 浏览统计 | 自行开发 | Google Analytics API |

**Vinext 是什么？**

Vinext 是 Cloudflare 推出的实验性框架，让你在 Vite 上写 Next.js 代码，然后部署到 Cloudflare Workers Edge。它提供了 Next.js App Router 的 API 兼容性，但运行在 Vite 构建系统上。
