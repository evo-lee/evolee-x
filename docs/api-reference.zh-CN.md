# API 参考

[English](./api-reference.md) | 简体中文

## 文档说明

本文聚焦 `evolee-x` 的核心内容层、SEO、图片分发和运行时快照 API。阅读顺序保持“先文档、后代码”，先解释设计职责，再落到代码入口。

## 内容层核心 API

### `parsePostSource(source, filePath)`

- 文件：`lib/content/frontmatter.ts`
- 入参：
  `source`：原始 Markdown/MDX 文件内容
  `filePath`：用于错误提示的源文件路径
- 出参：
  `{ body, frontmatter }`，其中 `frontmatter` 已被规范化为 `PostFrontmatter`
- 逻辑说明：
  使用 `gray-matter` 解析 YAML frontmatter，再用 `PostSchema` 做校验，并补齐 `tags`、`draft`、`featured` 的默认值
- 异常情况：
  frontmatter 缺字段、格式错误或不满足 schema 时直接抛错

示例：

```ts
const { body, frontmatter } = parsePostSource(source, 'content/posts/hello-world.mdx');
```

### `processMarkdown(source)`

- 文件：`lib/content/processor.ts`
- 入参：
  `source`：去掉 frontmatter 后的 Markdown/MDX 正文
- 出参：
  `{ html, rawHtml, text, excerpt, headings }`
- 逻辑说明：
  走 unified 处理链，生成 HTML、提取标题、生成纯文本与摘要，并把公开 HTML 里的图片地址重写为固定变体路由
- 异常情况：
  解析、代码高亮或转换阶段失败时向上抛出

示例：

```ts
const result = await processMarkdown(body);
console.log(result.html);
```

### `resolveCoverImage({ slug, html, cover, coverAlt })`

- 文件：`lib/content/cover-resolver.ts`
- 入参：
  `slug`：文章 slug
  `html`：重写前的正文 HTML
  `cover`：frontmatter 显式封面
  `coverAlt`：frontmatter 显式 alt 文本
- 出参：
  `CoverResolution`
- 逻辑说明：
  严格走三级回退：
  `cover` -> 正文首图 -> `/images/default-cover.svg`
  同时把结果写入 `content/.generated/covers/`
- 异常情况：
  写入旁路 JSON 失败时向上抛出

示例：

```ts
const cover = await resolveCoverImage({ slug, html, cover, coverAlt });
```

### `getAllPosts()` 与 `getPostBySlug(slug)`

- 文件：`lib/content/posts.ts`
- 入参：
  `getPostBySlug` 需要 `slug`
- 出参：
  `PostSummary[]` 或 `Post | null`
- 逻辑说明：
  读取 Markdown 文件、校验 frontmatter、处理 Markdown、解析封面、在非开发环境过滤 draft，并按日期倒序排序
- 异常情况：
  非 `ENOENT` 的文件读取错误和解析错误会继续抛出

示例：

```ts
const posts = await getAllPosts();
const post = await getPostBySlug('hello-world');
```

## 运行时快照 API

### `getRuntimePosts()`、`getRuntimePostBySlug(slug)`、`getRuntimePages()`

- 文件：`lib/content/runtime.ts`
- 入参：
  需要时传 `slug`
- 出参：
  从 `content/.generated/runtime-data.json` 恢复出的运行时实体
- 逻辑说明：
  把序列化后的 ISO 日期字符串恢复成 `Date`，并提供适用于 Worker 运行时的查询函数
- 异常情况：
  正常情况下不应抛出运行时异常；缺失实体返回 `null`

示例：

```ts
const posts = getRuntimePosts();
const page = getRuntimePageBySlug('about');
```

### `scripts/content/build-runtime-data.ts`

- 文件：`scripts/content/build-runtime-data.ts`
- 入参：
  无，脚本直接执行
- 出参：
  写出 `content/.generated/runtime-data.json`
- 逻辑说明：
  收集文章、页面、标签、分类和标签计数，并序列化成一个适合 Cloudflare Worker 读取的快照文件
- 异常情况：
  失败时打印错误并以状态码 `1` 退出

示例：

```bash
node --import tsx scripts/content/build-runtime-data.ts
```

## SEO API

### `buildSiteMetadata()`

- 文件：`lib/seo/metadata.ts`
- 出参：
  根布局使用的 `Metadata`
- 逻辑说明：
  统一站点标题模板、描述、作者和默认分享图

### `buildPageMetadata(options)`

- 文件：`lib/seo/metadata.ts`
- 入参：
  `path`、`title`、`description`、可选 `image`、可选 `noIndex`
- 出参：
  页面级 `Metadata`
- 逻辑说明：
  生成 canonical、Open Graph、Twitter card 和 robots

### `buildPostMetadata(post)`

- 文件：`lib/seo/metadata.ts`
- 入参：
  `Post` 或 `PostSummary`
- 出参：
  文章级 `Metadata`
- 逻辑说明：
  优先使用文章自己的 SEO 字段，处理 canonical 回退、文章类型 OG 信息，以及 draft 的 `noindex`

示例：

```ts
const metadata = buildPostMetadata(post);
```

### 结构化数据 Builder

- 文件：`lib/seo/structured-data.ts`
- 核心函数：
  `buildPersonStructuredData()`
  `buildWebsiteStructuredData()`
  `buildCollectionPageStructuredData()`
  `buildBreadcrumbStructuredData()`
  `buildBlogPostingStructuredData()`
- 逻辑说明：
  分别为根布局、首页、集合页和文章页输出 JSON-LD
- 关键点：
  `buildBlogPostingStructuredData()` 使用固定 `og-cover` 变体，不暴露原始源图地址

示例：

```ts
const jsonLd = buildBlogPostingStructuredData(post);
```

## 图片分发 API

### `getImageUrl(src, variant, options)`

- 文件：`lib/cloudflare/images.ts`
- 入参：
  `src`：原始资源路径或 URL
  `variant`：`thumb-sm | thumb-md | cover-md | cover-lg | og-cover`
  `options.absolute`：是否生成绝对地址
- 出参：
  `/image/{variant}/{token}` 或其绝对 URL
- 逻辑说明：
  缺失地址或 data URL 会回退到默认封面，然后把原始源图编码成 token，最后返回公开图片路由
- 异常情况：
  正常使用下不会抛错；非法 token 的处理由路由层负责

示例：

```ts
const url = getImageUrl('/images/hello-world-cover.svg', 'thumb-md');
```

### `app/image/[variant]/[token]/route.ts`

- 文件：`app/image/[variant]/[token]/route.ts`
- 入参：
  路由参数 `variant` 和 `token`
- 出参：
  带缓存头和诊断头的图片响应
- 逻辑说明：
  校验变体、解码 token、拉取原始资源，并附带 `Cache-Control` 和 `X-Image-*` 响应头返回
- 异常情况：
  未知变体或上游资源不可用时返回 `404`

示例：

```txt
GET /image/thumb-md/L2ltYWdlcy9oZWxsby13b3JsZC1jb3Zlci5zdmc
```

### `ArticleImage` 与 `CoverImage`

- 文件：
  `components/ui/ArticleImage.tsx`
  `components/ui/CoverImage.tsx`
- 入参：
  图片地址、alt 文本和可选 `priority`
- 出参：
  包装后的 `next/image`
- 逻辑说明：
  列表项固定走缩略图变体，文章头图固定走封面变体

## 关键代码逻辑设计思路

- 内容严格在构建期校验，尽早失败，避免坏数据进入运行时
- Cloudflare Worker 运行时只读取快照 JSON，不依赖目录遍历
- SEO 和图片逻辑集中化，避免页面路由堆积重复规则
- 公开 HTML 只使用稳定、命名化的图片变体

## 推荐阅读顺序

1. `README.zh-CN.md`
2. `docs/phases/`
3. `docs/api-reference.zh-CN.md`
4. `lib/content/*`
5. `lib/seo/*`
6. `app/*` 与 `components/*`
