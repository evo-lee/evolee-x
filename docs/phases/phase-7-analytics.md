# Phase 7 — 分析系统 / Analytics System

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 7 的目标是把 Umami 和 GA4 接到站点根部，同时把事件归属收拢到一个中央注册表里，避免后续组件各自直连 provider 造成漂移。

Phase 7 introduces a dual-analytics system with explicit ownership rules. Umami handles reading-oriented interactions, while GA4 is reserved for acquisition and conversion analysis.

---

## 本阶段交付 / Deliverables

- `lib/analytics/event-registry.ts`
- `lib/analytics/providers.ts`
- `lib/analytics/track.ts`
- `lib/analytics/route-change-debug.tsx`
- `components/analytics/TrackedLink.tsx`
- `app/layout.tsx` 根级接入 Umami + GA4

---

## 事件归属 / Event Ownership

### Umami

- `toc_click`
- `copy_code`
- `open_search`
- `click_cover`
- `read_related_post`

### Both

- `outbound_link`

### GA4

- `subscribe`
- `generate_lead`
- `download_file`
- `sign_up`

---

## 关键实现 / Key Implementation Notes

### 中央注册表

`event-registry.ts` 定义统一事件名、目标 provider、事件分类和说明。组件不再直接决定“发给谁”。

### Provider 探测

`providers.ts` 暴露 `hasUmami()` 与 `hasGA4()`，避免把全局对象判断散落到 UI 层。

### Fail-open tracking

`track.ts` 根据注册表分发事件。provider 缺失、脚本未加载或运行时报错时，只在开发环境输出 warning，不影响页面行为。

### Root integration

`app/layout.tsx` 现在：

- 通过 `next/script` 受控加载 Umami
- 通过 `@next/third-parties/google` 接入 GA4
- 通过 feature flag 独立启停两套系统

### 开发期路由验证

`RouteChangeDebug` 会在开发环境打印 SPA 路由变化，帮助验证 pageview 行为而不暴露用户可见 UI。

### 已接线的交互点

- `SearchTrigger` → `open_search`
- `CopyCodeButton` → `copy_code`
- `ArticleToc` → `toc_click`
- `ArticleCard` 封面点击 → `click_cover`
- `RelatedPosts` → `read_related_post`

---

## 当前结果 / Current Outcome

完成 Phase 7 后，项目已经具备这些能力：

- Umami 和 GA4 可通过 feature flag 独立禁用
- 自定义事件由中央注册表统一管理
- 交互组件不再直接访问 provider 全局对象
- 路由变化在开发环境中可被直接观察和验证

---

## 下一步 / Next Step

下一阶段进入 Phase 8，接入静态搜索：

- 构建期搜索索引
- 懒加载搜索客户端
- `SearchTrigger` 接入真正的搜索弹窗
