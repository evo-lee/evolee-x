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

## 通用执行链路

1. CLI 入口脚本构造 `ToolContext`。
2. `runTool(context)` 解析 CLI 模式。
3. 根据 `--file`、`--glob` 或 `--changed-files` 解析目标文件。
4. 读取文件内容并序列化成 AI payload。
5. `client.ts` 发起请求。
6. 校验结构化输出。
7. 除非使用 `--dry-run`，否则写出 JSON 和 Markdown 报告。

## 必需环境变量

- `ANTHROPIC_API_KEY`

## CLI 模式

- `--file <path>`
- `--glob <pattern>`
- `--changed-files`
- `--dry-run`

## 失败模型

- CLI 模式非法：
  立即抛错
- API Key 缺失：
  在请求前直接抛错
- 模型输出不合法：
  schema 校验失败
- 没有匹配文件：
  会写出说明“没有匹配结果”的报告

## 示例

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
```
