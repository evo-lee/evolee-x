# AI 工具链

[English](./ai-tooling.md) | 简体中文

## 说明范围

本文说明 Phase 9 引入的编辑辅助 CLI 工具。

## 主要文件

- `scripts/ai/shared/run-tool.ts`
- `scripts/ai/shared/client.ts`
- `scripts/ai/shared/file-resolver.ts`
- `scripts/ai/shared/schema-validator.ts`
- `scripts/ai/shared/reporter.ts`
- `scripts/ai/proofread.ts`
- `scripts/ai/summarize.ts`
- `scripts/ai/seo-suggest.ts`
- `scripts/ai/typography-review.ts`

## 可用命令

- `npm run ai:proofread`
- `npm run ai:summarize`
- `npm run ai:seo-suggest`
- `npm run ai:typography-review`

## 先用大白话说清楚

这一套 AI 工具不是“自动改稿系统”，而是“AI 审稿助手”。

它的真实工作方式是：

1. 读取你指定的内容文件
2. 读取对应的 prompt 模板
3. 把两者一起发给 Anthropic 模型
4. 要求模型只返回固定 JSON 格式
5. 程序校验这个 JSON 是否合法
6. 最后把建议写成报告

所以要点只有两个：

- 它默认不会自动修改你的文章
- 只有你主动执行 `npm run ai:*` 时它才会工作

## 通用执行链路

1. CLI 入口脚本构造 `ToolContext`。
2. `runTool(context)` 解析 CLI 模式。
3. 根据 `--file`、`--glob` 或 `--changed-files` 解析目标文件。
4. 读取文件内容并序列化成 AI payload。
5. `client.ts` 发起请求。
6. 校验结构化输出。
7. 除非使用 `--dry-run`，否则写出 JSON 和 Markdown 报告。

## 它具体读了什么，写了什么

### 输入

- 你指定的文章文件
- `prompts/` 目录里的对应提示词
- 命令参数，例如 `--file`、`--glob`

### 输出

默认写到：

```txt
reports/ai/
```

通常会生成：

- `*.json`：机器可读结果
- `*.md`：人直接看的报告

### 不会做的事

- 不会自动改写你的 `.md` / `.mdx`
- 不会在你没执行命令时偷偷调用模型
- 不会跳过结构校验直接信任模型返回值

## Provider 配置

现在支持两种通用 AI 模式：

- `anthropic`
- `openai`

通过下面这个变量切换：

```env
AI_PROVIDER=anthropic
```

或：

```env
AI_PROVIDER=openai
```

### Anthropic 模式

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=你的Key
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### OpenAI 模式

```env
AI_PROVIDER=openai
OPENAI_API_KEY=你的Key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

### `BASE_URL` 是干嘛的

这个参数的作用是：

- 默认连官方接口
- 也可以改成你自己的代理地址
- 也可以改成兼容 OpenAI / Anthropic 协议的服务地址

也就是说，这一层不只是“换官方 key”，还支持“换请求入口地址”。

## 必需环境变量

- `AI_PROVIDER`
- `ANTHROPIC_API_KEY`，当 `AI_PROVIDER=anthropic`
- `OPENAI_API_KEY`，当 `AI_PROVIDER=openai`

## CLI 模式

- `--file <path>`
- `--glob <pattern>`
- `--changed-files`
- `--dry-run`

## 最常见的调用方式

### 只检查一篇文章

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
```

### 检查一批文章

```bash
npm run ai:seo-suggest -- --glob "content/posts/*.mdx"
```

### 只试运行，不写报告

```bash
npm run ai:typography-review -- --file content/posts/hello-world.mdx --dry-run
```

## 失败模型

- CLI 模式非法：
  立即抛错
- API Key 缺失：
  在请求前直接抛错
- 模型输出不合法：
  schema 校验失败
- 没有匹配文件：
  会写出说明“没有匹配结果”的报告

## 新手怎么理解最省事

最简单的理解方式：

- `proofread`：看错别字、病句、表达清不清楚
- `summarize`：帮你总结文章
- `seo-suggest`：看标题、描述、SEO 方向
- `typography-review`：看排版和阅读体验

你写完文章以后，再手动跑一次它，让它给建议，然后你自己决定要不要改。

如果你只是想先跑通：

- 想走 Anthropic，就配 `AI_PROVIDER=anthropic`
- 想走 OpenAI，就配 `AI_PROVIDER=openai`

## 示例

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
```
