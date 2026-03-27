# 新手入门教程

[English](./getting-started.md) | 简体中文

## 先说清楚：这个程序是干嘛的

这个项目可以理解成一个“个人博客程序”。

你可以用它做这些事：

- 写技术文章
- 写读书笔记
- 写个人随笔
- 做一个简单的个人主页
- 把整站部署到 Cloudflare Workers

它的特点是：

- 文章直接写在本地文件里，不用数据库
- 页面是静态优先的，访问速度快
- 自带 SEO、搜索、图片处理、分析埋点
- 适合自己长期维护

如果你是新手，可以把它当成：

“改几份配置文件 + 写 Markdown 文章 + 运行几条命令，就能上线一个个人博客。”

## 你需要先准备什么软件

开始之前，电脑里最好先装好下面这些东西：

### 1. Node.js

要求：

- Node.js `20` 或更高版本

检查方法：

```bash
node -v
```

如果能看到类似 `v20.x.x` 的输出，就说明可以。

### 2. npm

一般装 Node.js 的时候会一起装。

检查方法：

```bash
npm -v
```

### 3. Git

用来下载代码、提交代码、推送到远程仓库。

检查方法：

```bash
git --version
```

### 4. 可选：Cloudflare 账号

如果你只是想在自己电脑上跑起来，不需要这个。

如果你想真正部署上线到 Cloudflare Workers，就需要：

- Cloudflare 账号
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 5. 可选：Anthropic API Key

如果你想用项目里的 AI 编辑工具，就需要：

- `ANTHROPIC_API_KEY` 或 `OPENAI_API_KEY`

如果你暂时不用 AI 功能，可以先不配。

## 第一次上手，照着做就能跑通

### 第 1 步：下载项目

如果你是从 GitHub 拉代码：

```bash
git clone <你的仓库地址>
cd evolee-x
```

### 第 2 步：安装依赖

```bash
npm install
```

这一步会把项目需要的包都装下来。

### 第 3 步：准备环境变量

复制一份环境变量模板：

```bash
cp .env.example .env.local
```

如果你只是本地开发，最开始可以只保留默认值，不一定要全部填写。

最常用的是这些：

```env
# 是否开启中文排版增强
NEXT_PUBLIC_ENABLE_HETI=true

# 是否开启 Umami
NEXT_PUBLIC_ENABLE_UMAMI=false

# 是否开启 GA4
NEXT_PUBLIC_ENABLE_GA=false
```

新手建议一开始先把分析系统关掉，先把站点跑起来。

### 第 4 步：启动项目

```bash
npm run dev
```

成功后，你会看到本地开发地址，通常是：

```txt
http://localhost:3000
```

这时候在浏览器里打开它，就能看到站点了。

## 这个项目第一次启动时，背后做了什么

你运行：

```bash
npm run dev
```

它不是只做一件事，而是做了三件事：

1. 先把文章和页面整理成运行时要用的 JSON 数据
2. 再生成站内搜索要用的索引文件
3. 最后启动 Next.js 本地开发服务

也就是说，这个项目的思路是：

“先准备好内容数据，再启动页面。”

这样做的好处是：

- 页面逻辑更简单
- Cloudflare Workers 更容易部署
- 搜索、SEO、文章列表都会更稳定

## 项目目录怎么理解

新手只需要先认识下面几个目录：

### `content/`

这里放文章和页面内容。

- `content/posts/`：博客文章
- `content/pages/`：独立页面，比如 About

### `lib/`

这里放“真正干活”的代码。

比如：

- `lib/site.ts`：站点名字、描述、导航菜单
- `lib/content/`：文章读取和处理
- `lib/seo/`：SEO 信息
- `lib/search/`：搜索

### `app/`

这里是页面路由。

你可以理解成：

- 首页在哪里
- 文章详情页在哪里
- About 页面在哪里

### `public/`

这里放图片、图标这类静态文件。

## 第一个最常见的修改：改站点名字和导航

你最先应该改的是这个文件：

- [lib/site.ts](/Users/l/Documents/code/evolee-x/lib/site.ts)

示例：

```ts
export const siteConfig = {
  // 站点短名称
  name: 'my-blog',

  // 浏览器标题、页面标题会用到这个
  title: '我的个人博客',

  // 站点简介，SEO 也会用到
  description: '记录编程、阅读和生活。',

  // 你正式上线后的网址
  baseUrl: 'https://your-site.workers.dev',

  // 站点语言
  locale: 'zh-CN',

  // 作者名
  author: '你的名字',

  // 顶部导航菜单
  nav: [
    { href: '/', label: '首页' },
    { href: '/posts', label: '文章' },
    { href: '/archives', label: '归档' },
    { href: '/about', label: '关于' },
    { href: '/projects', label: '项目' },
  ],
} as const;
```

这段代码每一项的作用都很直白：

- `name`：程序内部使用的站点名
- `title`：浏览器标题和 SEO 标题常用
- `description`：站点介绍
- `baseUrl`：正式上线后的网址
- `locale`：语言
- `author`：作者名
- `nav`：顶部菜单

你只改这里，就能改掉一大半站点基础信息。

## 第二个最常见的修改：写第一篇文章

新建一个文件：

```txt
content/posts/my-first-post.mdx
```

直接照着下面写：

````md
---
# 文章标题，必填
title: 我的第一篇文章

# 文章简介，列表页和 SEO 会用到
description: 这是我用这个博客程序写的第一篇文章。

# 发布时间，必填
date: 2026-03-27

# 标签，可以写多个
tags:
  - 入门
  - 教程

# 分类，可写可不写
category: 学习记录

# 是否为草稿，true 表示正式环境不显示
draft: false

# 是否推荐文章
featured: true
---

# 我的第一篇文章

你好，这是一篇新的文章。

## 我能写什么

- 普通文字
- 列表
- 代码块
- 图片

## 代码示例

```ts
// 这是一个最简单的示例函数
export function greet(name: string) {
  return `你好，${name}`;
}
```
````

保存后，刷新浏览器，文章就会出现在站点里。

## 第三个最常见的修改：改 About 页面

这个文件就是 About 页面内容：

- [content/pages/about.mdx](/Users/l/Documents/code/evolee-x/content/pages/about.mdx)

你可以直接改成：

```md
---
title: 关于我
description: 这里是我的个人介绍页面。
---

# 关于我

大家好，我是 xxx。

我主要会写这些内容：

- 编程学习笔记
- 读书记录
- 项目复盘
```

这类页面的写法和文章很像，只是 frontmatter 字段更少。

## 搜索、分析、排版开关怎么改

你平时主要改的是 `.env.local`。

推荐新手一开始这样配：

```env
# 开启中文排版增强
NEXT_PUBLIC_ENABLE_HETI=true

# 先关闭分析系统，等站点稳定后再开
NEXT_PUBLIC_ENABLE_UMAMI=false
NEXT_PUBLIC_ENABLE_GA=false
```

### 每个参数是干嘛的

- `NEXT_PUBLIC_ENABLE_HETI`
  是否开启中文排版增强

- `NEXT_PUBLIC_ENABLE_UMAMI`
  是否开启 Umami 分析

- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`
  Umami 脚本地址

- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
  Umami 站点 ID

- `NEXT_PUBLIC_ENABLE_GA`
  是否开启 GA4

- `NEXT_PUBLIC_GA_ID`
  GA4 的 ID

如果你不懂分析系统是什么，先把它们关掉，不影响写文章和本地运行。

## AI 工具到底是怎么运作的

你可以把它理解成：

“把你选中的文章内容发给 AI 看一遍，然后 AI 返回一份建议报告。”

它不是自动帮你改文章，更不是你一启动项目它就偷偷运行。

### 什么时候才会调用 AI

只有你主动运行这些命令时，AI 才会工作：

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
npm run ai:summarize -- --file content/posts/hello-world.mdx
npm run ai:seo-suggest -- --file content/posts/hello-world.mdx
npm run ai:typography-review -- --file content/posts/hello-world.mdx
```

如果你只是想快速校对一篇文章，也可以直接用短命令：

```bash
npm run ai -- hello-world.mdx
```

也就是说：

- 你不运行 `npm run ai:*`
- 它就不会调用 AI

### 它运行时到底做了什么

以 `npm run ai:proofread -- --file content/posts/hello-world.mdx` 为例，流程是这样的：

1. 先读取你指定的文章文件
2. 再读取对应的提示词模板
3. 把“文章内容 + 提示词”一起发给 Anthropic
4. 要求模型只返回结构化 JSON 结果
5. 程序检查返回格式是不是合法
6. 最后把结果写到 `reports/ai/` 里

### 它会不会直接修改我的文章

不会。

当前这套 AI 工具默认只做两件事：

- 读取文件
- 生成建议报告

它不会直接覆盖你的 `.mdx` 文件。

### AI 看完后，结果放在哪里

默认会写到：

```txt
reports/ai/
```

通常会生成两份文件：

- 一份 `.json`
- 一份 `.md`

你可以直接打开 Markdown 报告看建议。

### `--dry-run` 是什么

如果你只想试运行，不想生成报告文件，可以加：

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx --dry-run
```

这样它会跑流程，但不会把报告写进 `reports/ai/`。

### 它依赖什么

至少要配置 provider 和对应 key：

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=你的真实Key
```

或者：

```env
AI_PROVIDER=openai
OPENAI_API_KEY=你的真实Key
```

如果没配对，运行时会直接报错。

## 每段关键代码分别是做什么的

这里挑几个你最常会遇到的代码入口，用最简单的话解释。

### 1. `lib/site.ts`

作用：

- 管站点名字
- 管站点描述
- 管导航菜单

你把它当成“站点总配置”就行。

### 2. `content/posts/*.mdx`

作用：

- 真正存放文章内容

你把它当成“博客正文文件”就行。

### 3. `content/pages/*.mdx`

作用：

- 存放 About、Projects 这种独立页面内容

### 4. `lib/content/frontmatter.ts`

作用：

- 检查文章头部信息写得对不对

比如：

- 标题有没有写
- 日期有没有写
- `draft` 是不是布尔值

### 5. `lib/content/processor.ts`

作用：

- 把 Markdown 正文变成网页能显示的 HTML
- 顺便提取摘要、标题目录等数据

### 6. `lib/search/client.ts`

作用：

- 把用户输入的关键词拿去做搜索

### 7. `app/layout.tsx`

作用：

- 所有页面都会经过这里
- 放全局样式、分析脚本、主题初始化这些全局逻辑

## 我想改样式，从哪开始最简单

新手最简单的改法有三个：

### 1. 改站点名字和菜单

改：

- [lib/site.ts](/Users/l/Documents/code/evolee-x/lib/site.ts)

### 2. 改全局样式

看：

- `app/globals.css`

如果你只是想改字体、颜色、间距，这里通常最先动。

### 3. 改文章内容

改：

- `content/posts/*.mdx`
- `content/pages/*.mdx`

如果你暂时不会 React，这种改法最适合先上手。

## 一步一步部署到 Cloudflare

如果你已经能在本地跑起来，再做部署。

### 第 1 步：准备 Cloudflare 凭据

你需要：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 第 2 步：本地先构建一遍

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run cf:build
```

如果这里都通过，说明本地构建没问题。

### 第 3 步：手动部署

```bash
npm run cf:deploy
```

### 第 4 步：检查是否成功

部署后访问：

```txt
https://你的域名或workers地址/api/health
```

如果返回：

```json
{
  "ok": true,
  "status": "healthy"
}
```

基本就说明站点已经起来了。

## 常见报错怎么处理

### 1. `node: command not found`

原因：

- 没装 Node.js

解决：

- 安装 Node.js 20+
- 重新打开终端

### 2. `npm install` 很慢或者失败

原因：

- 网络问题
- npm 源有问题

解决：

- 先确认网络正常
- 必要时切换 npm 源

### 3. `Invalid frontmatter`

原因：

- 文章头部格式写错了

最常见的是：

- 少了 `title`
- 少了 `description`
- `date` 格式不对
- `draft` 写成了字符串

错误示例：

```md
draft: "false"
```

正确写法：

```md
draft: false
```

### 4. 页面打不开，但命令没报错

先检查：

- 终端里 `npm run dev` 是否还在运行
- 浏览器地址是不是 `http://localhost:3000`
- 文章文件是不是放到了 `content/posts/`

### 5. 搜索没结果

先检查：

- 是否真的有文章内容
- `npm run dev` 或 `npm run build` 是否成功执行
- `public/search-index.json` 是否被生成

### 6. Cloudflare 部署失败

优先检查：

- `CLOUDFLARE_API_TOKEN` 是否正确
- `CLOUDFLARE_ACCOUNT_ID` 是否正确
- `wrangler.jsonc` 配置是否被改坏
- 本地 `npm run cf:build` 是否成功

### 7. 分析脚本报错

如果你暂时不需要分析系统，最简单的做法是先关掉：

```env
NEXT_PUBLIC_ENABLE_UMAMI=false
NEXT_PUBLIC_ENABLE_GA=false
```

## 推荐的新手使用顺序

如果你是第一次接触这个项目，建议按这个顺序来：

1. 先 `npm install`
2. 再 `cp .env.example .env.local`
3. 把分析功能先关掉
4. 跑 `npm run dev`
5. 改 `lib/site.ts`
6. 新建一篇 `content/posts/*.mdx`
7. 改 `content/pages/about.mdx`
8. 跑 `npm run build`
9. 最后再考虑部署到 Cloudflare

这样最稳，不容易一开始就被部署、分析、AI 工具这些额外功能绊住。

## 如果你只想做最小可用修改

你只改这 3 个地方，就已经能把它变成你自己的站：

1. [lib/site.ts](/Users/l/Documents/code/evolee-x/lib/site.ts)
2. [content/pages/about.mdx](/Users/l/Documents/code/evolee-x/content/pages/about.mdx)
3. `content/posts/` 里的文章文件

## 继续往下看什么

如果你已经能跑起来，下一步推荐读这些文档：

- [README.zh-CN.md](../README.zh-CN.md)
- [内容管线](./content-pipeline.zh-CN.md)
- [搜索系统](./search-system.zh-CN.md)
- [分析系统](./analytics-system.zh-CN.md)
- [AI 工具链](./ai-tooling.zh-CN.md)
- [运维说明](./operations.zh-CN.md)

如果你只是想快速改内容，不一定要先读这些，先把文章写出来更重要。
