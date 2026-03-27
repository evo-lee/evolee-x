# 内容管线

[English](./content-pipeline.md) | 简体中文

## 说明范围

本文说明 `evolee-x` 里 Markdown / MDX 内容如何被处理成可供运行时直接消费的数据。

## 目标

- 在渲染前完成内容校验
- 一次性生成摘要、标题目录和封面信息
- 避免 Cloudflare Workers 运行时遍历文件系统
- 让路由层只负责渲染，不负责解析内容

## 主要文件

- `lib/content/frontmatter.ts`
- `lib/content/processor.ts`
- `lib/content/posts.ts`
- `lib/content/pages.ts`
- `lib/content/cover-resolver.ts`
- `lib/content/runtime.ts`
- `scripts/content/build-runtime-data.ts`

## 整体链路

1. 作者在 `content/posts/` 或 `content/pages/` 中编写 Markdown / MDX。
2. `parsePostSource()` 或 `parsePageSource()` 解析并校验 frontmatter。
3. `processMarkdown()` 渲染 HTML，并提取 headings、纯文本和摘要。
4. `resolveCoverImage()` 选择封面图，并写出生成旁路文件。
5. `getAllPosts()` 或 `getPostBySlug()` 组装标准化文章模型。
6. `scripts/content/build-runtime-data.ts` 把文章、页面、标签和分类序列化到 `content/.generated/runtime-data.json`。
7. `lib/content/runtime.ts` 再把该 JSON 恢复成适合 Worker 运行时使用的实体。

## 核心函数

### `parsePostSource(source, filePath)`

- 作用：
  解析 YAML frontmatter，并校验文章模型
- 入参：
  原始内容字符串和源文件路径
- 出参：
  `{ body, frontmatter }`
- 异常情况：
  frontmatter 不合法时立即抛错

### `processMarkdown(source)`

- 作用：
  把正文转换成可渲染、可搜索的输出
- 入参：
  去掉 frontmatter 后的正文
- 出参：
  `{ html, rawHtml, text, excerpt, headings }`
- 关键点：
  `rawHtml` 会被保留，用于图片重写前的封面探测

### `resolveCoverImage({ slug, html, cover, coverAlt })`

- 作用：
  为文章选定最终封面图
- 回退链路：
  显式 `cover` -> 正文首图 -> 默认封面 SVG
- 副作用：
  向 `content/.generated/covers/` 写入生成 JSON

### `getAllPosts()` 与 `getPostBySlug(slug)`

- 作用：
  为路由和脚本暴露标准化文章模型
- 关键规则：
  draft 只在开发环境可见

## 数据形态

内容层主要产出两类数据：

- 完整实体：
  带 HTML 和 headings 的文章或页面对象
- 摘要实体：
  供列表页、归档页、标签页使用的轻量文章数据

## 错误处理策略

- schema 错误尽早失败
- slug 候选文件不存在时返回 `null`
- 非 `ENOENT` 的读取错误继续抛出
- 生成旁路文件失败视为构建链路失败

## 这样设计的原因

- 昂贵处理只在构建期做一次
- Worker 运行时只消费 JSON，行为更稳定
- 路由文件不用再关心解析、摘要提取和封面回退逻辑

## 示例

```ts
import { getPostBySlug } from '@/lib/content/posts';
import { buildPostMetadata } from '@/lib/seo/metadata';

const post = await getPostBySlug('hello-world');

if (post) {
  const metadata = buildPostMetadata(post);
  console.log(post.headings, metadata.title);
}
```
