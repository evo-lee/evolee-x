# AI Tooling

English | [简体中文](./ai-tooling.zh-CN.md)

## Scope

This document explains the editorial CLI tools added in Phase 9.

## Main Files

- `scripts/ai/shared/run-tool.ts`
- `scripts/ai/shared/client.ts`
- `scripts/ai/shared/file-resolver.ts`
- `scripts/ai/shared/schema-validator.ts`
- `scripts/ai/shared/reporter.ts`
- `scripts/ai/proofread.ts`
- `scripts/ai/summarize.ts`
- `scripts/ai/seo-suggest.ts`
- `scripts/ai/typography-review.ts`

## Available Commands

- `npm run ai:proofread`
- `npm run ai:summarize`
- `npm run ai:seo-suggest`
- `npm run ai:typography-review`

## Shared Execution Flow

1. CLI entry script builds a `ToolContext`.
2. `runTool(context)` parses CLI mode.
3. Target files are resolved from `--file`, `--glob`, or `--changed-files`.
4. File contents are read and serialized into the AI payload.
5. `client.ts` sends the request.
6. Structured output is validated.
7. JSON and Markdown reports are written unless `--dry-run` is used.

## Required Environment Variable

- `ANTHROPIC_API_KEY`

## CLI Modes

- `--file <path>`
- `--glob <pattern>`
- `--changed-files`
- `--dry-run`

## Failure Model

- invalid CLI mode:
  throws immediately
- missing API key:
  throws before request
- invalid model output:
  schema validation fails
- no matching files:
  writes a report explaining that nothing matched

## Example

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
```
