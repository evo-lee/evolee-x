# Monitoring Policy

## Objectives

The monitoring baseline stays intentionally light, but it must answer three questions:

1. Did deployment succeed?
2. Is the live Worker healthy?
3. Is build quality drifting in a way that needs intervention?

## Alert Rules

### Deployment Failure

- Source: GitHub Actions `Deploy` workflow
- Trigger: any failed run on `main`
- Action: GitHub email / notification to the maintainer

### Health Endpoint Failure

- Source: Cloudflare or external uptime monitor
- Target: `https://evolee-x.workers.dev/api/health`
- Trigger: 3 consecutive failures within 5 minutes
- Action: page or immediate notification to the maintainer

### Build Duration Regression

- Source: `reports/build/latest-build-report.json`
- Trigger: build duration increases materially across several deploys
- Action: inspect route growth, build-step inflation, and search/AI scripts

## Dashboard Ownership

- GitHub Actions: deployment success and CI failure visibility
- `/api/health`: runtime reachability and deployed version check
- `reports/build/`: build complexity and route inventory

## Minimum Review Cadence

- Check deploy history after each production push
- Check build reports when route count or build time changes unexpectedly
- Reconfirm health monitor configuration after any domain or Worker rename
