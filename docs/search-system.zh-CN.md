# 搜索系统

[English](./search-system.md) | 简体中文

## 说明范围

本文说明站内搜索从构建期索引生成到客户端查询的完整工作方式。

## 主要文件

- `scripts/content/build-search-index.ts`
- `lib/search/types.ts`
- `lib/search/client.ts`
- `components/search/SearchModal.tsx`
- `components/search/SearchResults.tsx`
- `components/ui/SearchTrigger.tsx`

## 设计目标

- 不依赖远程搜索服务
- 用户未使用搜索前，不预加载整份索引
- 用加权模糊搜索保证体验
- 优先支持键盘交互

## 整体流程

1. `scripts/content/build-search-index.ts` 生成 `public/search-index.json`。
2. 页面正常加载时不会主动拉取搜索索引。
3. `SearchTrigger` 或快捷键打开搜索弹窗。
4. `primeSearchIndex()` 或 `searchDocuments(query)` 按需拉取索引 JSON。
5. Fuse.js 在浏览器中执行加权模糊匹配。
6. `SearchResults` 渲染命中的文章或页面。

## 核心函数

### `primeSearchIndex()`

- 作用：
  在用户正式搜索前预热缓存的 Fuse.js 实例
- 行为：
  懒加载搜索索引，失败时重置内部缓存，允许后续重试

### `searchDocuments(query)`

- 作用：
  基于生成好的文档列表执行模糊搜索
- 行为：
  先裁剪查询词，空字符串直接返回空数组，再对标题、摘要、描述、标签和分类等字段做加权搜索

## 搜索索引约定

搜索索引是静态 JSON 文件，因此 UI 不需要访问第三方服务或数据库就能完成搜索。

## 失败模型

- `/search-index.json` 拉取失败时，当次搜索会失败
- 加载失败后内部 promise 缓存会被重置，方便后续重试
- 搜索是可选能力，不影响首屏渲染

## 示例

```ts
import { searchDocuments } from '@/lib/search/client';

const results = await searchDocuments('cloudflare workers');
console.log(results.map((item) => item.title));
```
