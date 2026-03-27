# 运维说明

[English](./operations.md) | 简体中文

## 说明范围

本文说明仓库当前已有的轻量运维与观测工具。

## 主要文件

- `app/api/health/route.ts`
- `scripts/ci/build-report.ts`
- `config/ops/monitoring.md`
- `config/ops/runbook.md`
- `.github/workflows/deploy.yml`

## 健康检查接口

### `GET /api/health`

返回值示例：

```json
{
  "ok": true,
  "status": "healthy",
  "version": "0.1.0",
  "env": "production",
  "timestamp": "2026-03-27T00:00:00.000Z"
}
```

可用于简单存活检测、部署后验证和环境确认。

## 构建报告

`scripts/ci/build-report.ts` 会读取 Next.js 的 app paths manifest，并写出：

- `reports/build/latest-build-report.json`
- `reports/build/latest-build-report.md`

当前报告包含：

- 生成时间
- 构建耗时
- 包版本
- 路由数量
- 静态 / 动态路由数量
- warning

## Cloudflare 部署

项目通过 OpenNext 部署到 Cloudflare Workers。

### 本地部署路径

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run cf:build
npm run cf:deploy
```

### CI 部署路径

推送到 `main` 会触发 `.github/workflows/deploy.yml`，执行顺序为：

1. `npm ci`
2. `npm run lint:content`
3. `npm run lint`
4. `npm run type-check`
5. `npm run build`
6. `npm run cf:build`
7. `npm run cf:deploy`
8. `curl https://evolee-x.workers.dev/api/health`

### 部署所需配置

- GitHub Actions Secrets：
  `CLOUDFLARE_API_TOKEN`
  `CLOUDFLARE_ACCOUNT_ID`
  `ANTHROPIC_API_KEY`
  `OPENAI_API_KEY`
- GitHub Actions Variables：
  `NEXT_PUBLIC_*`
  `AI_PROVIDER`
  `ANTHROPIC_BASE_URL`
  `OPENAI_BASE_URL`

### 部署排查要点

- 确认已经生成 `.open-next/`
- 确认 `wrangler.jsonc` 仍指向 `.open-next/worker.js`
- 确认 GitHub 中的 Cloudflare 凭据已配置
- 确认部署后 `/api/health` 返回期望版本

## 运维设计意图

- 健康检查回答：
  应用是否正常响应
- 构建报告回答：
  本次构建包含了什么
- 部署检查回答：
  最新版本是否成功到达 Cloudflare
- runbook 和 monitoring 文档回答：
  故障和部署检查应该如何处理

## 示例

```bash
node --import tsx scripts/ci/build-report.ts
```
