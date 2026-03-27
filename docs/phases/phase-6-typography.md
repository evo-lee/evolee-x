# Phase 6 — 中文排版系统 / Chinese Typography System

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 6 的目标是把 Heti 风格排版增强接到文章阅读面，同时严格控制作用域，避免影响导航、标签、代码块和表格等非阅读区域。

Phase 6 adds Heti-style typography enhancement to reading surfaces only. The enhancement is container-scoped, optional via feature flag, and designed to fail open.

---

## 本阶段交付 / Deliverables

- `lib/typography/heti-client.ts`
- `lib/typography/excluded-selectors.ts`
- `lib/typography/policy.ts`
- `components/article/ArticleTypography.tsx`
- `styles/heti-overrides.css`
- `config/typography/chinese-typography.md`

---

## 关键实现 / Key Implementation Notes

### 1. 客户端初始化边界

`ArticleTypography.tsx` 是一个极小的 client component，只负责在挂载后调用 `initHetiForArticle()`，不渲染额外 UI。

### 2. 作用域限定

排版增强只作用于带有 `data-article-content="..."` 的容器。`ArticleContent.tsx` 成为统一挂载点：

- 文章详情页正文
- About 这类长文内容页

### 3. 排除区域

`excluded-selectors.ts` 明确排除了这些区域：

- `pre`, `code`, `table`, `kbd`, `samp`
- tags、page meta、toc
- buttons、form controls
- `data-no-typography="true"` 标记区

### 4. Feature Flag

当 `NEXT_PUBLIC_ENABLE_HETI=false` 时，初始化直接跳过，页面仍保持原始可读样式。

### 5. 样式覆盖

`styles/heti-overrides.css` 只对 `[data-article-content].heti` 生效，补充：

- 行高与段落流动
- 链接下划线节奏
- 暗色模式阅读对比
- code/table 等区域的 spacing 保护

---

## 当前结果 / Current Outcome

完成 Phase 6 后，项目已经具备这些能力：

- 中文长文阅读面可选启用 Heti 风格增强
- 中英混排和标点节奏可以在客户端做轻量润色
- 非正文 UI 不会被自动排版逻辑误伤
- About 与 Post 两类长文页面都能复用同一套排版挂载机制

---

## 下一步 / Next Step

下一阶段进入 Phase 7，接入分析系统：

- Umami 与 GA4 的职责分离
- 中央事件注册表
- route change debug 与 fail-open tracking
