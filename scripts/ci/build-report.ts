#!/usr/bin/env node --import tsx

import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

type AppPathManifest = Record<string, string>;

type BuildReport = {
  generatedAt: string;
  durationMs: number;
  packageVersion: string;
  routeCount: number;
  routes: string[];
  staticRouteCount: number;
  dynamicRouteCount: number;
  warnings: string[];
};

const OUTPUT_DIR = path.join(process.cwd(), 'reports', 'build');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'latest-build-report.json');
const MARKDOWN_PATH = path.join(OUTPUT_DIR, 'latest-build-report.md');

function renderMarkdown(report: BuildReport) {
  return [
    '# Build Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Duration (ms): ${report.durationMs}`,
    `- Package version: ${report.packageVersion}`,
    `- Route count: ${report.routeCount}`,
    `- Static routes: ${report.staticRouteCount}`,
    `- Dynamic routes: ${report.dynamicRouteCount}`,
    '',
    '## Routes',
    '',
    ...report.routes.map((route) => `- ${route}`),
    '',
    '## Warnings',
    '',
    ...(report.warnings.length > 0 ? report.warnings.map((warning) => `- ${warning}`) : ['- None']),
    '',
  ].join('\n');
}

async function main() {
  const startedAt = Date.now();
  const packageJson = JSON.parse(await readFile(path.join(process.cwd(), 'package.json'), 'utf8')) as {
    version: string;
  };
  const appPathManifest = JSON.parse(
    await readFile(path.join(process.cwd(), '.next', 'server', 'app-paths-manifest.json'), 'utf8')
  ) as AppPathManifest;

  const routes = Object.keys(appPathManifest).sort();
  const staticRouteCount = routes.filter((route) => !route.includes('[')).length;
  const dynamicRouteCount = routes.length - staticRouteCount;
  const warnings: string[] = [];

  if (routes.length === 0) {
    warnings.push('No app routes were found in the build manifest.');
  }

  const report: BuildReport = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    packageVersion: packageJson.version,
    routeCount: routes.length,
    routes,
    staticRouteCount,
    dynamicRouteCount,
    warnings,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2));
  await writeFile(MARKDOWN_PATH, renderMarkdown(report));

  const existingFiles = await readdir(OUTPUT_DIR);
  if (!existingFiles.includes('.gitkeep')) {
    warnings.push('reports/build/.gitkeep is missing.');
  }

  console.log(`[build-report] Wrote ${OUTPUT_PATH}`);
  console.log(`[build-report] Wrote ${MARKDOWN_PATH}`);
}

main().catch((error) => {
  console.error('[build-report] Failed to build report');
  console.error(error);
  process.exit(1);
});
