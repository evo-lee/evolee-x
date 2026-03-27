#!/usr/bin/env node --import tsx

import { access, readdir } from 'fs/promises';
import path from 'path';
import { AI_TOOL_CONTEXTS } from '@/scripts/ai/shared/tool-contexts';
import { runToolWithOptions } from '@/scripts/ai/shared/run-tool';
import type { AIReviewTool, ToolCliOptions } from '@/scripts/ai/shared/types';

const CONTENT_ROOTS = ['content/posts', 'content/pages'];

type CliSelection = {
  tool: AIReviewTool;
  options: ToolCliOptions;
};

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    })
  );

  return nested.flat();
}

async function resolveShortcutTarget(input: string) {
  const normalized = input.replace(/\\/g, '/');

  if (normalized.startsWith('content/')) {
    return normalized;
  }

  const directCandidates = [
    `content/posts/${normalized}`,
    `content/posts/${normalized}.md`,
    `content/posts/${normalized}.mdx`,
    `content/pages/${normalized}`,
    `content/pages/${normalized}.md`,
    `content/pages/${normalized}.mdx`,
  ];

  for (const candidate of directCandidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }

  const allFiles = (
    await Promise.all(CONTENT_ROOTS.map((root) => walk(root)))
  )
    .flat()
    .map((filePath) => filePath.replace(/\\/g, '/'));

  const basenameMatches = allFiles.filter((filePath) => path.basename(filePath) === normalized);

  if (basenameMatches.length === 1) {
    return basenameMatches[0];
  }

  const slugMatches = allFiles.filter((filePath) => {
    const basename = path.basename(filePath, path.extname(filePath));
    return basename === normalized;
  });

  if (slugMatches.length === 1) {
    return slugMatches[0];
  }

  if (basenameMatches.length > 1 || slugMatches.length > 1) {
    throw new Error(`Multiple content files matched "${input}". Use a full content path instead.`);
  }

  return `content/posts/${normalized}`;
}

function printUsage() {
  console.log('Usage: npm run ai -- <file-or-slug>');
  console.log('Usage: npm run ai -- --tool summarize <file-or-slug>');
  console.log('Usage: npm run ai -- --glob "content/posts/*.mdx"');
  console.log('Usage: npm run ai -- --changed-files');
}

async function parseCli(argv: string[]): Promise<CliSelection> {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const changedFiles = args.includes('--changed-files');
  const globIndex = args.indexOf('--glob');
  const toolIndex = args.indexOf('--tool');
  const tool = (toolIndex !== -1 ? args[toolIndex + 1] : 'proofread') as AIReviewTool;

  if (!AI_TOOL_CONTEXTS[tool]) {
    throw new Error(`Unknown AI tool "${tool}".`);
  }

  if (changedFiles) {
    return {
      tool,
      options: {
        mode: 'changed-files',
        dryRun,
      },
    };
  }

  if (globIndex !== -1) {
    return {
      tool,
      options: {
        mode: 'glob',
        value: args[globIndex + 1],
        dryRun,
      },
    };
  }

  const positional = args.filter((arg, index) => {
    if (arg === '--dry-run' || arg === '--changed-files') {
      return false;
    }

    if ((arg === '--tool' || arg === '--glob') && index < args.length - 1) {
      return false;
    }

    if (index > 0 && (args[index - 1] === '--tool' || args[index - 1] === '--glob')) {
      return false;
    }

    return !arg.startsWith('--');
  });

  const target = positional[0];

  if (!target) {
    printUsage();
    throw new Error('Missing file, slug, --glob, or --changed-files.');
  }

  return {
    tool,
    options: {
      mode: 'file',
      value: await resolveShortcutTarget(target),
      dryRun,
    },
  };
}

void parseCli(process.argv)
  .then(({ tool, options }) => runToolWithOptions(AI_TOOL_CONTEXTS[tool], options))
  .catch((error) => {
    console.error('[ai] Failed');
    console.error(error);
    process.exit(1);
  });
