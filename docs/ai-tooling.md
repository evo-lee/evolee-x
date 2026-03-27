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

- `npm run ai -- hello-world.mdx` default shortcut for `proofread`
- `npm run ai:proofread`
- `npm run ai:summarize`
- `npm run ai:seo-suggest`
- `npm run ai:typography-review`

## Plain-Language Summary

These tools are not an automatic rewrite system. They are AI review helpers.

The real flow is:

1. read the content files you selected
2. read the matching prompt template
3. send both to Anthropic
4. require the model to return JSON only
5. validate the JSON shape
6. write the result as reports

The two most important facts are:

- nothing runs unless you execute an `npm run ai:*` command
- the tools do not directly edit your article files

## Shared Execution Flow

1. CLI entry script builds a `ToolContext`.
2. `runTool(context)` parses CLI mode.
3. Target files are resolved from `--file`, `--glob`, or `--changed-files`.
4. File contents are read and serialized into the AI payload.
5. `client.ts` sends the request.
6. Structured output is validated.
7. JSON and Markdown reports are written unless `--dry-run` is used.

## What The Tool Reads And Writes

### Input

- the content files you selected
- the matching prompt file from `prompts/`
- CLI options such as `--file`, `--glob`, or `--changed-files`

### Output

By default the reports are written into:

```txt
reports/ai/
```

Typical output files:

- `*.json`: machine-readable result
- `*.md`: human-readable report

### What It Does Not Do

- it does not automatically rewrite your `.md` or `.mdx`
- it does not run during `npm run dev`
- it does not trust raw model output without schema validation

## Provider Configuration

The tooling now supports two generic AI modes:

- `anthropic`
- `openai`

Switch with:

```env
AI_PROVIDER=anthropic
```

or:

```env
AI_PROVIDER=openai
```

### Anthropic mode

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### OpenAI mode

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

### What `BASE_URL` is for

It lets you:

- use the official API endpoint
- use your own proxy
- use a provider-compatible API gateway

## Required Environment Variables

- `AI_PROVIDER`
- `ANTHROPIC_API_KEY` when `AI_PROVIDER=anthropic`
- `OPENAI_API_KEY` when `AI_PROVIDER=openai`

## CLI Modes

- `--file <path>`
- `--glob <pattern>`
- `--changed-files`
- `--dry-run`

## Common Ways To Use It

### Review one article

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
```

### Short form for default proofread

```bash
npm run ai -- hello-world.mdx
```

This shortcut assumes `proofread` unless you pass `--tool`.

### Review many articles

```bash
npm run ai:seo-suggest -- --glob "content/posts/*.mdx"
```

### Use another tool with the short entry

```bash
npm run ai -- --tool summarize hello-world.mdx
```

### Test the flow without writing a report

```bash
npm run ai:typography-review -- --file content/posts/hello-world.mdx --dry-run
```

## Failure Model

- invalid CLI mode:
  throws immediately
- missing API key:
  throws before request
- invalid model output:
  schema validation fails
- no matching files:
  writes a report explaining that nothing matched

## Easiest Mental Model For Beginners

- `proofread`: wording, spelling, grammar
- `summarize`: article summary help
- `seo-suggest`: title and description suggestions
- `typography-review`: readability and formatting review

Write the article first, then run one AI command, then review the report yourself.

## Example

```bash
npm run ai:proofread -- --file content/posts/hello-world.mdx
```
