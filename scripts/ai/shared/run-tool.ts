import path from 'path';
import { readInputFiles, resolveFiles } from '@/scripts/ai/shared/file-resolver';
import { writeReport, summarizeSuggestions } from '@/scripts/ai/shared/reporter';
import { requestSuggestions } from '@/scripts/ai/shared/client';
import type { AIReport, ToolCliOptions, ToolContext } from '@/scripts/ai/shared/types';

export function parseArgs(argv: string[]): ToolCliOptions {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileIndex = args.indexOf('--file');
  const globIndex = args.indexOf('--glob');
  const changedFiles = args.includes('--changed-files');

  if (fileIndex !== -1) {
    return {
      mode: 'file',
      value: args[fileIndex + 1],
      dryRun,
    };
  }

  if (globIndex !== -1) {
    return {
      mode: 'glob',
      value: args[globIndex + 1],
      dryRun,
    };
  }

  if (changedFiles) {
    return {
      mode: 'changed-files',
      dryRun,
    };
  }

  throw new Error('Use one of --file, --glob, or --changed-files.');
}

export async function runTool(context: ToolContext) {
  const options = parseArgs(process.argv);
  return runToolWithOptions(context, options);
}

export async function runToolWithOptions(context: ToolContext, options: ToolCliOptions) {
  const files = await resolveFiles(options.mode, options.value);

  if (files.length === 0) {
    const report: AIReport = {
      tool: context.tool,
      mode: options.mode,
      dryRun: options.dryRun,
      generatedAt: new Date().toISOString(),
      files: [],
      suggestions: [],
      summary: 'No matching content files found.',
    };

    await writeReport(report);
    console.log(`[ai:${context.tool}] No matching files.`);
    return;
  }

  const inputs = await readInputFiles(files);
  const payload = JSON.stringify(
    {
      tool: context.tool,
      files: inputs,
    },
    null,
    2
  );

  const result = await requestSuggestions({
    ...context,
    promptPath: path.join(process.cwd(), context.promptPath),
    payload,
  });

  const report: AIReport = {
    tool: context.tool,
    mode: options.mode,
    dryRun: options.dryRun,
    generatedAt: new Date().toISOString(),
    files,
    suggestions: result.suggestions,
    summary: result.summary || summarizeSuggestions(result.suggestions),
  };

  const output = await writeReport(report);

  console.log(`[ai:${context.tool}] ${report.summary}`);
  if (output) {
    console.log(`[ai:${context.tool}] Wrote ${output.jsonPath}`);
    console.log(`[ai:${context.tool}] Wrote ${output.markdownPath}`);
  }
}
