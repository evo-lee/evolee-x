# Phase 5 — 展示层组件系统 / Presentation Component System

Phase 5 的目标不是继续往页面里堆 JSX，而是把已经稳定下来的内容、SEO、图片分发能力，真正沉淀成一层可复用的展示组件系统。

Phase 5 turns the now-stable content, SEO, and image layers into a reusable presentation component system. Route files stop owning layout details and become composition entry points.

---

## 本阶段完成了什么 / What This Phase Delivers

在这一阶段里，`app/(site)` 下的页面不再直接承担大部分展示结构，而是通过 `components/site/` 中的页面骨架与基元来组装：

- 首页 hero 被抽成 `HomeHero`
- taxonomy 快捷入口被抽成 `TaxonomyChipList`
- 列表页空状态被抽成 `EmptyState`
- 文章列表中的 meta 与 tag 展示分别抽成 `PostMeta` 与 `TagList`
- 通用页面头部被抽成 `PageHeader`
- 文章头部被抽成 `ArticleHeader`
- 区块标题被抽成 `SectionIntro`
- 归档列表被抽成 `ArchiveList`

更重要的是，这一阶段继续往上抽了一层“页面骨架”：

- `CollectionPage` 统一了 collection 类页面的 `StructuredData + PageHeader + body`
- `ContentPage` 统一了内容型页面的 `StructuredData + PageHeader + rich content`
- `ArticlePage` 统一了文章详情页的 metadata script、文章头部、封面图、正文结构

这样 Phase 5 完成后，route 文件主要负责三件事：

- 读取运行时内容
- 生成 route 级 metadata
- 选择合适的页面组件进行组合

---

## 组件结构 / Component Structure

当前展示层结构可以理解为三层：

```text
app/(site)/*
  └── route composition

components/site/ArticlePage.tsx
components/site/CollectionPage.tsx
components/site/ContentPage.tsx
  └── page shells

components/site/PageHeader.tsx
components/site/ArticleHeader.tsx
components/site/PostList.tsx
components/site/ArchiveList.tsx
components/site/HomeHero.tsx
components/site/RichContent.tsx
  └── section-level components

components/site/PostMeta.tsx
components/site/TagList.tsx
components/site/TaxonomyChipList.tsx
components/site/EmptyState.tsx
components/site/SectionIntro.tsx
  └── small presentation primitives
```

这意味着页面结构已经从“每个 route 自己拼一套”转向“页面壳层统一，局部组件复用”。

---

## 为什么这一步现在做 / Why It Happens Here

Phase 2 时只抽了最小页面基元，是因为那时内容路由、SEO 和图片策略都还没完全稳定。如果太早做组件系统，组件边界会不断重写。

到了 Phase 5，以下三层已经稳定：

- 内容运行时快照已经固定
- SEO builder 已经接到核心路由
- 图片分发变体和 loader 已经确定

因此现在再抽展示层，组件边界才是可靠的。

---

## 完成后的结果 / Outcome

完成 Phase 5 后，项目已经具备这些能力：

- route 文件更短，职责更清晰
- 页面级结构不再在多个 route 中重复
- 首页、列表页、归档页、文章页、内容页已经有一致的展示抽象
- 未来做视觉重构或新增页面时，优先改组件层而不是散改 route

这意味着项目已经从“可浏览的博客应用”进入“可维护的展示层系统”阶段。

---

## 下一步 / Next Step

下一阶段应进入 Phase 6，接入中文排版系统，而不是继续泛化做视觉重构：

- 在 `ArticleContent` 上挂 Heti 风格增强
- 明确排除代码块、表格、导航和交互控件
- 使用 feature flag 提供快速回退能力

Phase 6 should now add scoped Chinese typography enhancement on top of the component boundaries delivered here.
