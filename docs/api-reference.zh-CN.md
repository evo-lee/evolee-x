# API 参考

[English](./api-reference.md) | 简体中文

## 文档说明

本文覆盖 `evolee-x` 的内容层、SEO、图片分发、搜索、分析、AI 工具链和运维脚本中的核心函数与脚本。

结构保持统一：

1. 先讲上下文
2. 再讲函数级说明
3. 再讲设计思路
4. 最后给调用链示例

当前代码库基本没有需要单独讲解的长生命周期服务类，主要由聚焦职责的函数与构建脚本组成。

## 内容层核心 API

### `parsePostSource(source, filePath)`

- 文件：`lib/content/frontmatter.ts`
- 入参：
  `source`：包含 YAML frontmatter 的原始 Markdown/MDX 内容
  `filePath`：用于格式化错误信息的源文件路径
- 出参：
  `{ body, frontmatter }`
- 逻辑说明：
  先用 `gray-matter` 解析 frontmatter，再用 `PostSchema` 做 Zod 校验，同时补齐可选字段默认值，最后返回正文和已校验元数据
- 异常情况：
  必填字段缺失、日期非法、数组格式错误、schema 不满足时直接抛错

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
  走 unified 渲染管线，提取 headings，生成公开 HTML，同时保留原始 HTML 供封面探测使用，再生成纯文本和摘要
- 异常情况：
  Markdown 解析、rehype 转换、代码高亮或清洗阶段失败时向上抛出

示例：

```ts
const rendered = await processMarkdown(body);
console.log(rendered.headings);
```

### `resolveCoverImage({ slug, html, cover, coverAlt })`

- 文件：`lib/content/cover-resolver.ts`
- 入参：
  `slug`：文章 slug，用于生成旁路文件名
  `html`：公开图片重写前的原始 HTML
  `cover`：frontmatter 显式封面
  `coverAlt`：frontmatter 显式 alt 文本
- 出参：
  `CoverResolution`
- 逻辑说明：
  严格按以下回退链路选封面：
  显式 `cover` -> 正文首图 -> `/images/default-cover.svg`
  选完后再把结果写入 `content/.generated/covers/` 下的 JSON 旁路文件
- 异常情况：
  写文件失败时向上抛出

示例：

```ts
const coverImage = await resolveCoverImage({ slug, html, cover, coverAlt });
```

### `getAllPosts()`

- 文件：`lib/content/posts.ts`
- 入参：
  无
- 出参：
  `Promise<PostSummary[]>`
- 逻辑说明：
  加载所有文章文件，解析 frontmatter，渲染 Markdown，解析封面，在非开发环境过滤 draft，最后按发布时间倒序返回摘要列表
- 异常情况：
  文件读取、frontmatter、Markdown 或封面解析错误会继续抛出

示例：

```ts
const posts = await getAllPosts();
```

### `getPostBySlug(slug)`

- 文件：`lib/content/posts.ts`
- 入参：
  `slug`：相对于 `content/posts` 的路由 slug
- 出参：
  `Promise<Post | null>`
- 逻辑说明：
  依次尝试候选 Markdown 文件名，命中后组装完整文章模型；如果文件不存在，或当前环境下该文章是隐藏 draft，则返回 `null`
- 异常情况：
  检查候选文件时会忽略 `ENOENT`
  其他读取、解析、渲染错误会继续抛出

示例：

```ts
const post = await getPostBySlug('hello-world');
```

### `getPostsByTag(tag)` 与 `getPostsByCategory(category)`

- 文件：`lib/content/posts.ts`
- 入参：
  `tag`：精确标签值
  `category`：精确分类值
- 出参：
  过滤后的 `Promise<PostSummary[]>`
- 逻辑说明：
  基于 `getAllPosts()` 的结果做精确匹配过滤
- 异常情况：
  继承 `getAllPosts()` 的失败行为

## 运行时快照 API

### `getRuntimePosts()`、`getRuntimePostBySlug(slug)`、`getRuntimePages()`、`getRuntimePageBySlug(slug)`

- 文件：`lib/content/runtime.ts`
- 入参：
  需要时传 `slug`
- 出参：
  从 `content/.generated/runtime-data.json` 恢复出的运行时实体
- 逻辑说明：
  把序列化后的 ISO 日期恢复成 `Date`，并暴露适合 Worker 运行时使用的查找函数
- 异常情况：
  缺失实体返回 `null`；正常使用下不应抛错

示例：

```ts
const aboutPage = getRuntimePageBySlug('about');
```

### `scripts/content/build-runtime-data.ts`

- 文件：`scripts/content/build-runtime-data.ts`
- 入参：
  无，脚本入口
- 出参：
  生成 `content/.generated/runtime-data.json`
- 逻辑说明：
  收集文章、页面、标签、分类和计数，拼成适合 Cloudflare Worker 读取的统一快照
- 异常情况：
  打印错误并以状态码 `1` 退出

示例：

```bash
node --import tsx scripts/content/build-runtime-data.ts
```

## SEO 与 Metadata API

### `buildSiteMetadata()`

- 文件：`lib/seo/metadata.ts`
- 入参：
  无
- 出参：
  根布局使用的 `Metadata`
- 逻辑说明：
  统一站点标题模板、默认描述、作者信息、canonical 基址和默认 OG/Twitter 图片
- 异常情况：
  正常使用下无

### `buildPageMetadata({ path, title, description, image, noIndex })`

- 文件：`lib/seo/metadata.ts`
- 入参：
  `path`：页面路径
  `title`：页面标题
  `description`：摘要说明
  `image`：可选社交分享图
  `noIndex`：可选 robots 覆盖
- 出参：
  通用页面 `Metadata`
- 逻辑说明：
  在一个入口中统一生成 canonical、Open Graph、Twitter card 和可选 noindex 规则
- 异常情况：
  正常使用下无

### `buildPostMetadata(post)`

- 文件：`lib/seo/metadata.ts`
- 入参：
  `post`：`Post` 或 `PostSummary`
- 出参：
  文章页 `Metadata`
- 逻辑说明：
  优先使用 SEO 专用标题和描述字段，计算 canonical 回退，构造文章型 OG 数据，并为 draft 增加 `noindex`
- 异常情况：
  只要文章结构合法，正常使用下无异常

示例：

```ts
const metadata = buildPostMetadata(post);
```

### `buildPageContentMetadata(page)`

- 文件：`lib/seo/metadata.ts`
- 入参：
  `page`：Markdown 驱动的页面实体
- 出参：
  通用页面 `Metadata`
- 逻辑说明：
  把页面模型适配到标准页面 metadata builder

### 结构化数据 Builders

- 文件：`lib/seo/structured-data.ts`
- 核心函数：
  `buildPersonStructuredData()`
  `buildWebsiteStructuredData()`
  `buildCollectionPageStructuredData()`
  `buildBreadcrumbStructuredData()`
  `buildBlogPostingStructuredData()`
- 逻辑说明：
  为根布局、首页、集合页和文章页输出 JSON-LD
- 关键点：
  `buildBlogPostingStructuredData()` 使用固定图片变体，不暴露原始源图地址

## 图片分发 API

### `encodeImageToken(src)` 与 `decodeImageToken(token)`

- 文件：`lib/cloudflare/images.ts`
- 入参：
  `src`：原始图片路径或 URL
  `token`：公开图片路由中的 base64url token
- 出参：
  编码或解码后的字符串
- 逻辑说明：
  把原始图片引用转换为公开图片路由可使用的安全 token
- 异常情况：
  非法 token 的最终处理由消费它的路由层负责

### `getImageUrl(src, variant, options)`

- 文件：`lib/cloudflare/images.ts`
- 入参：
  `src`：原始资源路径或 URL
  `variant`：`VARIANT_CATALOG` 中的命名变体
  `options.absolute`：是否输出绝对 URL
- 出参：
  `/image/{variant}/{token}` 或其绝对地址
- 逻辑说明：
  缺失地址和 `data:` 地址都会回退到默认封面，再编码成 token，对外只暴露受控的公开路由
- 异常情况：
  正常使用下无

示例：

```ts
const ogUrl = getImageUrl('/images/cover.svg', 'og-cover', { absolute: true });
```

### `getVariantConfig(variant)`、`getThumbVariant(width)`、`getCoverVariant(width)`

- 文件：`lib/cloudflare/images.ts`
- 入参：
  `variant`：图片变体名
  `width`：期望宽度档位
- 出参：
  变体元数据或变体 key
- 逻辑说明：
  把宽高和比例决策集中在一个目录里，保证组件使用稳定图片尺寸

### `app/image/[variant]/[token]/route.ts`

- 文件：`app/image/[variant]/[token]/route.ts`
- 入参：
  路由参数 `variant` 和 `token`
- 出参：
  带缓存头和诊断头的图片响应
- 逻辑说明：
  校验变体、解码 token、拉取上游资源，再返回受控图片响应
- 异常情况：
  未知变体或上游资源不可用时返回 `404`

## 搜索 API

### `primeSearchIndex()`

- 文件：`lib/search/client.ts`
- 入参：
  无
- 出参：
  `Promise<void>`
- 逻辑说明：
  懒加载 `/search-index.json`，初始化并缓存 Fuse.js 实例，为后续搜索预热，同时不阻塞首屏渲染
- 异常情况：
  加载失败时会重置内部 promise 缓存，便于后续重试

### `searchDocuments(query)`

- 文件：`lib/search/client.ts`
- 入参：
  `query`：原始用户输入
- 出参：
  `Promise<SearchResult[]>`
- 逻辑说明：
  先裁剪输入，空字符串直接返回空数组；需要时加载缓存的 Fuse 索引，再基于标题、摘要、描述、标签和分类做加权搜索
- 异常情况：
  搜索索引拉取失败会继续向上抛出

示例：

```ts
const results = await searchDocuments('workers');
```

## 分析系统 API

### `trackEvent(name, params?)`

- 文件：`lib/analytics/track.ts`
- 入参：
  `name`：已注册的事件名
  `params`：可选事件负载
- 出参：
  `void`
- 逻辑说明：
  先去 `ANALYTICS_EVENT_REGISTRY` 查事件归属，再用 `hasUmami()` 和 `hasGA4()` 判断 provider 是否可用，最后把事件发往目标系统
- 异常情况：
  未注册事件会被忽略，并且仅在开发环境输出警告
  provider 上报失败会被捕获，保证分析系统不会阻塞 UI 行为

示例：

```ts
trackEvent('copy_code', {
  slug: 'hello-world',
});
```

### `ANALYTICS_EVENT_REGISTRY`

- 文件：`lib/analytics/event-registry.ts`
- 作用：
  中央事件归属表，明确每个事件属于 Umami、GA4，还是两边都发
- 设计意义：
  防止组件各自直连 provider 导致事件漂移

### `hasUmami()` 与 `hasGA4()`

- 文件：`lib/analytics/providers.ts`
- 作用：
  轻量级运行时守卫，用于判断各 provider 是否启用且可用

## AI 工具链 API

### `runTool(context)`

- 文件：`scripts/ai/shared/run-tool.ts`
- 入参：
  `context`：工具名、prompt 路径、schema、输出行为等上下文
- 出参：
  `Promise<void>`
- 逻辑说明：
  解析 CLI 参数，解析目标文件，读取输入内容，请求 Anthropic 客户端，校验结构化 JSON 输出，写入 JSON 与 Markdown 报告，并在终端打印摘要
- 异常情况：
  未提供合法 CLI 模式时直接抛错
  文件解析、API 请求、schema 校验、结果写入失败都会继续抛出
- CLI 模式：
  `--file <path>`
  `--glob <pattern>`
  `--changed-files`
  可选 `--dry-run`

示例：

```bash
npm run ai:seo-suggest -- --glob "content/posts/*.mdx"
```

### `scripts/ai/shared/client.ts`

- 文件：`scripts/ai/shared/client.ts`
- 作用：
  向 Anthropic 发送 prompt payload，并校验结构化返回值
- 异常情况：
  `ANTHROPIC_API_KEY` 缺失时直接抛错

## 运维与报告 API

### `GET /api/health`

- 文件：`app/api/health/route.ts`
- 入参：
  无
- 出参：
  JSON：
  `{ ok, status, version, env, timestamp }`
- 逻辑说明：
  暴露一个简单健康检查，同时返回包版本和当前环境，便于诊断
- 异常情况：
  正常使用下无

示例：

```txt
GET /api/health
```

### `scripts/ci/build-report.ts`

- 文件：`scripts/ci/build-report.ts`
- 入参：
  无，脚本入口
- 出参：
  写出：
  `reports/build/latest-build-report.json`
  `reports/build/latest-build-report.md`
- 逻辑说明：
  读取 `.next/server/app-paths-manifest.json`，统计路由数量，拆分静态/动态路由，记录 warning，并输出 JSON 与 Markdown 两种报告
- 异常情况：
  必要构建产物缺失或不可读时，以状态码 `1` 退出
- 额外说明：
  当前 `.gitkeep` warning 是在 `report` 对象创建后才追加的，所以写出的报告未必会包含这条 warning，后续如需更严格可再调整

示例：

```bash
node --import tsx scripts/ci/build-report.ts
```

## 关键代码逻辑设计思路

### 内容层

- 尽早校验
- 一次生成摘要与标题信息
- Worker 运行时只消费预计算结果

### SEO 与图片

- metadata 规则集中管理
- 对外只暴露固定图片变体
- 路由层保持轻量、确定

### 搜索与分析

- 非关键客户端系统懒加载
- 可选能力故障时 fail-open
- 所有分析事件走统一命名层

### AI 与运维

- AI 能力作为显式 CLI 工具，不隐藏进构建流程
- 同时输出机器可读和人工可读报告，便于审查

## 调用链示例

### 文章渲染链路

1. `parsePostSource()` 校验 frontmatter。
2. `processMarkdown()` 渲染正文并生成 excerpt/headings。
3. `resolveCoverImage()` 选出最终封面。
4. `getPostBySlug()` 组装完整文章模型。
5. `buildPostMetadata()` 生成该路由的 SEO 信息。

### 搜索链路

1. `SearchTrigger` 打开搜索 UI。
2. `primeSearchIndex()` 可选择性预热索引。
3. `searchDocuments(query)` 按需加载 `/search-index.json`。
4. Fuse.js 返回加权匹配结果供 UI 渲染。

### 分析链路

1. UI 组件调用 `trackEvent(name, params)`。
2. 事件注册表解析归属。
3. provider 守卫判断 Umami 或 GA4 是否可用。
4. 事件在 `try/catch` 中分发，保证 UI 不依赖分析成功。

## 推荐阅读顺序

1. [README.zh-CN.md](../README.zh-CN.md)
2. [`docs/phases/`](./phases)
3. [docs/api-reference.zh-CN.md](./api-reference.zh-CN.md)
4. `lib/content/*`
5. `lib/seo/*`、`lib/cloudflare/*`
6. `lib/search/*`、`lib/analytics/*`
7. `scripts/*`
