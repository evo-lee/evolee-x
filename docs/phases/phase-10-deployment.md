# Phase 10 — 部署流水线 / Deployment Pipeline

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 10 的目标是建立一套可重复、fail-fast 的 GitHub Actions 流水线，把生产部署和 AI 内容检查明确拆开。

Phase 10 adds two distinct GitHub Actions workflows: a production deployment workflow for `main`, and a separate AI content-check workflow for pull requests.

---

## 本阶段交付 / Deliverables

- `.github/workflows/deploy.yml`
- `.github/workflows/ai-content-check.yml`

---

## 关键实现 / Key Implementation Notes

### Deploy workflow

`deploy.yml` 在 `push` 到 `main` 时触发，并按 fail-fast 顺序执行：

1. `npm ci`
2. `npm run lint:content`
3. `npm run lint`
4. `npm run type-check`
5. `npm run build`
6. `npm run cf:build`
7. `npm run cf:deploy`
8. `curl https://evolee-x.workers.dev/api/health`

### Environment and secrets

workflow 使用：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_*` GitHub Variables

### AI content check workflow

`ai-content-check.yml` 在 PR 修改内容或 AI 相关文件时触发，并执行：

- `npm run ai:proofread -- --changed-files`
- `npm run ai:typography-review -- --changed-files`

AI 步骤使用 `continue-on-error: true`，只做 warning，不阻断 PR。

### Artifacts

`reports/ai/` 会作为 artifact 上传，便于下载报告而不污染仓库。

---

## 当前结果 / Current Outcome

完成 Phase 10 后，项目已经具备这些能力：

- `main` 分支 push 可触发完整部署链路
- 内容 lint 和类型检查成为部署前硬门禁
- AI 内容检查与正式部署分离
- AI 审查失败时保留为 advisory warning，而不是拦截 PR

---

## 下一步 / Next Step

下一阶段进入 Phase 11，补可观测与运维基线：

- `build-report.ts`
- monitoring 文档
- runbook 文档
