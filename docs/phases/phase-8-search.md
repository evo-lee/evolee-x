# Phase 8 — 搜索功能 / Search

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 8 的目标是实现构建期生成索引、前端按需加载的静态搜索，不引入独立搜索后端。

Phase 8 adds a static search system: build-time index generation, lazy client loading, and a lightweight modal triggered by keyboard shortcuts or the header search button.

---

## 本阶段交付 / Deliverables

- `scripts/content/build-search-index.ts`
- `lib/search/types.ts`
- `lib/search/client.ts`
- `components/search/SearchModal.tsx`
- `components/search/SearchResults.tsx`
- `package.json` build/dev/type-check/cf:preview 脚本更新

---

## 关键实现 / Key Implementation Notes

### 构建期索引

搜索索引在构建前写入 `public/search-index.json`，字段遵循 implementation plan：

- `slug`
- `title`
- `description`
- `tags`
- `category`
- `date`
- `summary`

### 懒加载客户端

`lib/search/client.ts` 只在搜索真正打开后才请求 `search-index.json`。索引和 Fuse 实例都做了单例缓存，避免重复加载。

### 搜索交互

`SearchModal.tsx` 提供：

- Header `SearchTrigger` 打开
- `Cmd+K` / `Ctrl+K` 打开
- `Esc` 关闭
- 300ms debounce
- 结果点击后关闭弹窗

### 与 Phase 7 的联动

搜索打开动作继续复用 `open_search` analytics 事件，不需要组件直接调用 provider。

---

## 当前结果 / Current Outcome

完成 Phase 8 后，项目已经具备这些能力：

- 每次构建自动更新静态搜索索引
- 初始页面加载不会请求搜索索引
- 搜索只在用户触发后加载
- 站点已经具备统一搜索入口和键盘快捷键

---

## 下一步 / Next Step

下一阶段进入 Phase 9，开始 AI 编辑工具链：

- CLI 级共享基础设施
- proofread / summarize / seo-suggest / typography-review
- `reports/ai/` 报告输出
