import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import type { AIReport, AISuggestion } from '@/scripts/ai/shared/types';

const REPORTS_DIR = path.join(process.cwd(), 'reports', 'ai');

function sanitizeName(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
}

function renderMarkdown(report: AIReport) {
  const lines: string[] = [
    `# ${report.tool} report`,
    '',
    `- Generated: ${report.generatedAt}`,
    `- Mode: ${report.mode}`,
    `- Dry run: ${report.dryRun ? 'yes' : 'no'}`,
    `- Files: ${report.files.length}`,
    '',
    '## Summary',
    '',
    report.summary,
    '',
    '## Suggestions',
    '',
  ];

  if (report.suggestions.length === 0) {
    lines.push('No suggestions.', '');
    return lines.join('\n');
  }

  report.suggestions.forEach((suggestion) => {
    lines.push(`### ${suggestion.title}`);
    lines.push('');
    lines.push(`- File: ${suggestion.file}`);
    lines.push(`- Severity: ${suggestion.severity}`);
    if (suggestion.line) {
      lines.push(`- Line: ${suggestion.line}`);
    }
    lines.push('');
    lines.push(suggestion.detail);
    lines.push('');
  });

  return lines.join('\n');
}

export async function writeReport(report: AIReport) {
  if (report.dryRun) {
    return null;
  }

  await mkdir(REPORTS_DIR, { recursive: true });

  const stamp = sanitizeName(report.generatedAt);
  const baseName = `${report.tool}-${stamp}`;
  const jsonPath = path.join(REPORTS_DIR, `${baseName}.json`);
  const markdownPath = path.join(REPORTS_DIR, `${baseName}.md`);

  await writeFile(jsonPath, JSON.stringify(report, null, 2));
  await writeFile(markdownPath, renderMarkdown(report));

  return { jsonPath, markdownPath };
}

export function summarizeSuggestions(suggestions: AISuggestion[]) {
  if (suggestions.length === 0) {
    return 'No issues detected.';
  }

  const counts = suggestions.reduce<Record<string, number>>((acc, suggestion) => {
    acc[suggestion.severity] = (acc[suggestion.severity] ?? 0) + 1;
    return acc;
  }, {});

  return `Found ${suggestions.length} suggestions (${counts.error ?? 0} error, ${counts.warning ?? 0} warning, ${counts.info ?? 0} info).`;
}
