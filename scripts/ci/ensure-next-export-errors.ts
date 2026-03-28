#!/usr/bin/env node --import tsx

import { access, copyFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';

function buildFallbackHtml(fileName: '404.html' | '500.html'): string {
  const title = fileName === '404.html' ? 'Page not found' : 'Internal server error';
  const description =
    fileName === '404.html'
      ? 'The requested page is not available.'
      : 'The server could not complete this request.';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${description}</p>
    </main>
  </body>
</html>
`;
}

async function copyIfNeeded(fileName: '404.html' | '500.html') {
  const source = path.join(process.cwd(), '.next', 'server', 'pages', fileName);
  const targetDir = path.join(process.cwd(), '.next', 'export');
  const target = path.join(targetDir, fileName);

  await mkdir(targetDir, { recursive: true });
  try {
    await access(source);
    await copyFile(source, target);
    console.log(`[next-export] Ensured ${target}`);
    return;
  } catch {}

  await writeFile(target, buildFallbackHtml(fileName), 'utf8');
  console.log(`[next-export] Generated fallback ${target}`);
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
