# Phase 5 — UI 组件库 / UI Component Library

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 5 的正式目标不是只做一层 `components/site/*` 包装，而是把博客真正需要的阅读、导航、分类和交互组件补齐，并让后续 Phase 6 的中文排版系统有明确挂载点。

Phase 5 formalizes the blog component layer into the structure described by the implementation plan. It creates explicit article, layout, taxonomy, and UI components so later phases do not depend on route-local JSX.

---

## 本阶段交付 / Deliverables

### `components/article/`

- `ArticleCard.tsx`
- `ArticleHeader.tsx`
- `ArticleContent.tsx`
- `ArticleToc.tsx`
- `RelatedPosts.tsx`
- `CopyCodeButton.tsx`

### `components/layout/`

- `Header.tsx`
- `Footer.tsx`
- `Pagination.tsx`

### `components/taxonomy/`

- `TagList.tsx`
- `CategoryBadge.tsx`

### `components/ui/`

- `ThemeToggle.tsx`
- `SearchTrigger.tsx`

---

## 关键实现 / Key Implementation Notes

- `SiteLayout` 现在通过 `Header` 与 `Footer` 组装站点壳层
- `PostList` 现在通过 `ArticleCard` 渲染文章列表项
- 文章详情页通过 `ArticleHeader + ArticleContent + RelatedPosts` 组装
- `ArticleToc` 是 client component，并带基础 ScrollSpy
- `ThemeToggle` 是 client component，支持本地主题持久化
- `SearchTrigger` 先提供结构化入口，搜索本体留给 Phase 8
- `Pagination` 已提供统一渲染逻辑，即使当前内容量仍只有单页

---

## 当前结果 / Current Outcome

完成 Phase 5 后，项目已经具备这些能力：

- 文章页的头部、正文、目录、相关文章有明确组件边界
- 站点头部、底部、分页、主题切换和搜索触发器不再散落在页面层
- 分类与标签从文章组件中独立出来
- Phase 6 可以直接在 `ArticleContent` 上接入中文排版系统

---

## 下一步 / Next Step

下一阶段进入 Phase 6，正式接入中文排版系统：

- `ArticleTypography` 客户端初始化边界
- Heti 风格增强和排除选择器
- 文章阅读面作用域样式
- 可通过 feature flag 快速回退
