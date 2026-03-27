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

## 运维设计意图

- 健康检查回答：
  应用是否正常响应
- 构建报告回答：
  本次构建包含了什么
- runbook 和 monitoring 文档回答：
  故障和部署检查应该如何处理

## 示例

```bash
node --import tsx scripts/ci/build-report.ts
```
