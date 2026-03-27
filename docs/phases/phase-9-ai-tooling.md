# Phase 9 — AI 编辑工具链 / AI Editorial Tooling

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 9 的目标是把 AI 能力限制在本地与 CI 的内容审查工作流里，而不是放进站点运行时路径。

Phase 9 adds a local and CI-friendly AI review pipeline. The site runtime remains fully independent from AI providers, while editorial tooling can generate structured reports for human review.

---

## 本阶段交付 / Deliverables

### 共享基础设施 / Shared Infrastructure

- `scripts/ai/shared/types.ts`
- `scripts/ai/shared/client.ts`
- `scripts/ai/shared/schema-validator.ts`
- `scripts/ai/shared/file-resolver.ts`
- `scripts/ai/shared/reporter.ts`
- `scripts/ai/shared/run-tool.ts`

### CLI 工具 / CLI Tools

- `scripts/ai/proofread.ts`
- `scripts/ai/summarize.ts`
- `scripts/ai/seo-suggest.ts`
- `scripts/ai/typography-review.ts`

### Prompt 模板 / Prompt Templates

- `prompts/proofread.md`
- `prompts/summarize.md`
- `prompts/seo-suggest.md`
- `prompts/typography-review.md`

---

## 关键实现 / Key Implementation Notes

### 统一报告结构

所有工具最终都输出同一种 `AIReport` 结构：

- tool
- execution mode
- dry-run state
- reviewed files
- structured suggestions
- human-readable summary

### Schema 校验

模型输出必须先通过 `zod` schema 校验，未通过时 CLI 直接退出非零状态。

### 执行模式

支持三种调用方式：

- `--file`
- `--glob`
- `--changed-files`

### Dry-run

`--dry-run` 下不会写 `reports/ai/`，但仍会执行解析、请求和控制台输出，适合 CI 预检查或本地试跑。

### 报告产物

非 dry-run 时，每次运行都会在 `reports/ai/` 下输出：

- `.json`
- `.md`

### Anthropic client

AI 请求统一通过 `shared/client.ts` 走 `@anthropic-ai/sdk`，要求：

- `ANTHROPIC_API_KEY`
- 超时控制
- 基础重试
- JSON-only 返回格式

---

## 当前结果 / Current Outcome

完成 Phase 9 后，项目已经具备这些能力：

- 本地和 CI 可运行的 AI 内容审查 CLI
- 结构化 schema 校验，避免随意解析模型输出
- 机器可读与人工可读的双报告输出
- AI 依赖仍然完全隔离在请求路径之外

---

## 下一步 / Next Step

下一阶段进入 Phase 10，补完整部署流水线：

- `deploy.yml`
- `ai-content-check.yml`
- GitHub Actions secrets / variables 接线
