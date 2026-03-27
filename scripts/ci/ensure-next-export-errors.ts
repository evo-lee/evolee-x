#!/usr/bin/env node --import tsx

import { copyFile, mkdir } from 'fs/promises';
import path from 'path';

async function copyIfNeeded(fileName: '404.html' | '500.html') {
  const source = path.join(process.cwd(), '.next', 'server', 'pages', fileName);
  const targetDir = path.join(process.cwd(), '.next', 'export');
  const target = path.join(targetDir, fileName);

  await mkdir(targetDir, { recursive: true });
  await copyFile(source, target);
  console.log(`[next-export] Ensured ${target}`);
}

async function main() {
  // OpenNext's Cloudflare build expects static error pages under `.next/export`.
  // Next.js 15 stores them under `.next/server/pages`, so copy them after build.
  await copyIfNeeded('404.html');
  await copyIfNeeded('500.html');
}

main().catch((error) => {
  console.error('[next-export] Failed to prepare static error pages');
  console.error(error);
  process.exit(1);
});
