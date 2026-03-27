# Operations Runbook

## Common Tasks

### 1. Verify a deployment

1. Open the latest `Deploy` workflow run in GitHub Actions.
2. Confirm `npm run cf:deploy` succeeded.
3. Check `https://evolee-x.workers.dev/api/health`.
4. Confirm the returned `version` matches `package.json`.

### 2. Roll back a bad deployment

1. Find the last known good commit on `main`.
2. Revert the bad commit or redeploy the known good commit.
3. Push to `main` so the deploy workflow runs again.
4. Verify `/api/health` after the rollback finishes.

### 3. Update environment variables

1. Local development values belong in `.env.local`.
2. Production `NEXT_PUBLIC_*` values belong in GitHub Actions Variables.
3. Secrets such as `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `ANTHROPIC_API_KEY` belong in GitHub Actions Secrets.
4. After updating variables, rerun the deploy workflow or push a new commit.

### 4. Clear stale build expectations

1. Inspect `reports/build/latest-build-report.json`.
2. Compare current route count and build duration with recent runs.
3. If route inventory changed intentionally, update the operational expectation.
4. If the drift is unexpected, inspect the last phases that changed `app/`, `scripts/content/`, or build scripts.

### 5. Cloudflare deployment troubleshooting

1. Confirm `.open-next/` was produced during the workflow.
2. Confirm `wrangler.jsonc` still points to `.open-next/worker.js`.
3. Confirm the Cloudflare account/token secrets are present.
4. Re-run the workflow after fixing credentials or config.
