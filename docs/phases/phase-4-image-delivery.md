# Phase 4 — 图片分发系统 / Image Delivery System

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm test` ✅ · `npm run lint` ✅ · `npm run type-check` ✅ · `npm run cf:build` ✅ · `cf:preview` 变体路由 / HTML 输出验证 ✅

---

## 概述 / Overview

Phase 4 的目标不是“把图片显示出来”这么简单，而是建立一套固定变体、可复用、对 Cloudflare Workers 友好的图片分发系统。

Phase 4 establishes a predefined image delivery pipeline. The app only consumes named variants, so route components never expose arbitrary width or transformation parameters.

这一阶段完成后，列表缩略图、文章头图、正文图片和社交分享图都走统一的 `/image/{variant}/{token}` 路由，公开 HTML 不再泄漏原始源图地址。

---

## 创建的文件 / Files Created

```
evolee-x/
├── lib/cloudflare/
│   ├── images.ts             ← 变体目录、token 编解码、URL builder
│   └── loader.ts             ← Next.js custom image loader
├── components/ui/
│   ├── ArticleImage.tsx      ← 列表缩略图包装
│   └── CoverImage.tsx        ← 文章头图包装
├── app/image/[variant]/[token]/
│   └── route.ts              ← 统一图片分发入口
├── public/images/
│   ├── default-cover.svg     ← 站点默认封面
│   ├── hello-world-cover.svg ← 示例文章封面
│   └── hello-world-inline.svg ← 示例正文图片
└── tests/content/
    └── cover-resolver.test.ts ← 封面三级回退测试
```

---

## 逐文件讲解 / File-by-File Explanation

### `lib/cloudflare/images.ts` — 变体目录与 URL 规则

这里集中定义 `thumb-sm`、`thumb-md`、`cover-md`、`cover-lg`、`og-cover` 五个固定变体，并提供 `getImageUrl()`、`encodeImageToken()`、`decodeImageToken()`。

这样页面层只知道“我要哪种用途的图片”，不直接拼接底层路由规则。

---

### `lib/cloudflare/loader.ts` — Next.js 自定义 loader

这个 loader 把 `next/image` 的 `src + width` 映射到预定义变体，而不是暴露任意尺寸参数。它满足了 Next.js 的图片接口要求，同时保持 Cloudflare 侧的 URL 规则统一。

---

### `components/ui/ArticleImage.tsx` 与 `components/ui/CoverImage.tsx`

两个包装组件分别负责：

- 列表页缩略图固定走 `thumb-md`
- 文章头图固定走 `cover-lg`

组件内部直接计算目标变体 URL，并使用 `unoptimized`，避免落回 Next 内建的 `/_next/image` 服务。

---

### `app/image/[variant]/[token]/route.ts` — 图片分发入口

这个 route handler 负责解码 token、拉取原始图片源、附加缓存头，并把当前变体信息写进响应头：

- `Cache-Control: public, max-age=31536000, immutable`
- `X-Image-Variant`
- `X-Image-Width`
- `X-Image-Height`

这样浏览器、边缘缓存和调试工具都能明确知道当前拿到的是哪个变体。

---

### `lib/content/processor.ts` — 正文图片重写

仅处理封面和列表图还不够，因为 MDX 正文里的 `<img>` 仍然会把原始源图地址暴露到公开 HTML。

这一阶段把 Markdown 处理链补了一层重写规则：正文图片统一改写为 `cover-md` 变体路由。为了不影响 `cover-resolver` 的首图提取，又保留了一份 `rawHtml` 给内容层内部使用。

---

### `lib/seo/metadata.ts` 与 `lib/seo/structured-data.ts`

SEO 层也接入了同一套图片策略：

- Open Graph / Twitter 图片走 `og-cover`
- `BlogPosting.image` 也走 `og-cover`

这样页面 `<meta>` 和 JSON-LD 不会再输出原始图片路径。

---

### `tests/content/cover-resolver.test.ts` — 三级回退验证

implementation plan 要求验证 `cover-resolver` 的三级回退：

1. frontmatter 显式封面优先
2. 否则回退正文首图
3. 否则回退站点默认图

这里用 Node 内建测试运行器把三种情况都覆盖了，并顺便校验生成的 `.generated/covers/*.json` 旁路文件。

---

## 当前结果 / Current Outcome

Phase 4 完成后，项目已经具备这些能力：

- 首页和文章列表稳定使用 `thumb-md`
- 文章头图使用 `cover-lg`
- 正文图片输出 `cover-md`
- 社交卡片和 `BlogPosting` 统一使用 `og-cover`
- 公开 HTML 不再出现 `/images/...` 这类原始源图路径
- Cloudflare 预览下 `/image/thumb-md/...` 返回 200，并带上变体响应头

---

## 下一步 / Next Step

下一阶段进入 Phase 5，开始把当前站点页面拆成真正可复用的 UI 组件：

- `ArticleCard`
- `ArticleHeader`
- `ArticleContent`
- `ArticleToc`
- `RelatedPosts`
- `Header` / `Footer` / `Pagination`

Phase 5 can now build on a stable content, SEO, and image pipeline instead of mixing presentation concerns into route files.
