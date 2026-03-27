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

## Cloudflare Deployment

The project deploys to Cloudflare Workers through OpenNext.

### Local deployment path

```bash
npm run lint
npm run test
npm run lint:content
npm run type-check
npm run cf:build
npm run cf:deploy
```

### CI deployment path

`main` pushes trigger `.github/workflows/deploy.yml`, which runs:

1. `npm ci`
2. `npm run lint:content`
3. `npm run lint`
4. `npm run type-check`
5. `npm run build`
6. `npm run cf:build`
7. `npm run cf:deploy`
8. `curl https://evolee-x.workers.dev/api/health`

### Required deployment configuration

- GitHub Actions Secrets:
  `CLOUDFLARE_API_TOKEN`
  `CLOUDFLARE_ACCOUNT_ID`
  `ANTHROPIC_API_KEY`
  `OPENAI_API_KEY`
- GitHub Actions Variables:
  `NEXT_PUBLIC_*`
  `AI_PROVIDER`
  `ANTHROPIC_BASE_URL`
  `OPENAI_BASE_URL`

### Deployment troubleshooting

- confirm `.open-next/` was produced
- confirm `wrangler.jsonc` still points to `.open-next/worker.js`
- confirm Cloudflare credentials are configured in GitHub
- confirm `/api/health` returns the expected version after deploy

## Operational Intent

- health checks answer:
  is the app responding
- build reports answer:
  what did the build contain
- deployment checks answer:
  did the latest release reach Cloudflare successfully
- runbook and monitoring docs answer:
  how should incidents and deployment checks be handled

## Example

```bash
node --import tsx scripts/ci/build-report.ts
```
