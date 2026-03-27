# Phase 11 — 可观测与运维 / Observability & Operations

> **完成日期 / Completed**: 2026-03-27
> **验收结果 / Acceptance**: `npm run lint` ✅ · `npm run type-check` ✅ · `npm run build` ✅

---

## 概述 / Overview

Phase 11 的目标不是引入沉重的监控平台，而是建立一套明确、可审计的构建与运行时可见性基线。

Phase 11 adds a lightweight operational baseline: explicit build reports, version-aware health checks, and documented monitoring and recovery procedures.

---

## 本阶段交付 / Deliverables

- `scripts/ci/build-report.ts`
- `config/ops/monitoring.md`
- `config/ops/runbook.md`
- `app/api/health/route.ts` 返回版本和环境信息
- `.github/workflows/deploy.yml` 上传 build report artifact

---

## 关键实现 / Key Implementation Notes

### Build report

`build-report.ts` 会读取 `.next/server/app-paths-manifest.json` 并写入：

- `reports/build/latest-build-report.json`
- `reports/build/latest-build-report.md`

报告内容包含：

- package version
- route count
- static / dynamic route split
- route inventory
- warnings

### Health endpoint

`/api/health` 现在返回：

- `ok`
- `status`
- `version`
- `env`
- `timestamp`

这让部署后验证不再只看 200，而是能确认实际部署版本。

### Monitoring policy

`config/ops/monitoring.md` 记录了三类核心监控：

- deploy failure
- health endpoint failure
- build duration drift

### Runbook

`config/ops/runbook.md` 覆盖：

- 验证部署
- 回滚坏版本
- 更新环境变量
- 检查 build report 漂移
- Cloudflare 部署排障

---

## 当前结果 / Current Outcome

完成 Phase 11 后，项目已经具备这些能力：

- 每次部署都能产出可下载的 build report artifact
- 健康检查返回版本和环境，便于核对线上状态
- 监控和运维规则不再只存在于口头约定

---

## Outcome

到这一阶段，implementation plan 中的 0-11 阶段已经全部完成。项目已经具备：

- Git-first 内容工作流
- Next.js 静态内容站点
- Cloudflare Workers 部署链路
- 搜索、排版、分析和 AI 审查能力
- 基础运维与观测基线
