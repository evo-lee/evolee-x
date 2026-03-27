# Operations

English | [简体中文](./operations.zh-CN.md)

## Scope

This document explains the lightweight operational tooling currently present in the repository.

## Main Files

- `app/api/health/route.ts`
- `scripts/ci/build-report.ts`
- `config/ops/monitoring.md`
- `config/ops/runbook.md`
- `.github/workflows/deploy.yml`

## Health Endpoint

### `GET /api/health`

Returns:

```json
{
  "ok": true,
  "status": "healthy",
  "version": "0.1.0",
  "env": "production",
  "timestamp": "2026-03-27T00:00:00.000Z"
}
```

Use it for simple uptime checks, deployment verification, and environment confirmation.

## Build Report

`scripts/ci/build-report.ts` reads the Next.js app paths manifest and writes:

- `reports/build/latest-build-report.json`
- `reports/build/latest-build-report.md`

The report currently captures:

- generation time
- build duration
- package version
- route count
- static versus dynamic route count
- warnings

## Operational Intent

- health checks answer:
  is the app responding
- build reports answer:
  what did the build contain
- runbook and monitoring docs answer:
  how should incidents and deployment checks be handled

## Example

```bash
node --import tsx scripts/ci/build-report.ts
```
