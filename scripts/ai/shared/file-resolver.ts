import { execFile } from 'child_process';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import type { ExecutionMode } from '@/scripts/ai/shared/types';

const execFileAsync = promisify(execFile);

const CONTENT_FILE_PATTERN = /^(content\/.+\.(md|mdx))$/;

function globToRegExp(pattern: string) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regex = escaped.replace(/\*\*/g, '::DOUBLE_STAR::').replace(/\*/g, '[^/]*');
  return new RegExp(`^${regex.replace(/::DOUBLE_STAR::/g, '.*')}$`);
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    })
  );
  return results.flat();
}

export async function resolveFiles(mode: ExecutionMode, value?: string): Promise<string[]> {
  if (mode === 'file') {
    if (!value) {
      throw new Error('Missing --file value.');
    }
    return [value];
  }

  if (mode === 'glob') {
    if (!value) {
      throw new Error('Missing --glob value.');
    }
    const matcher = globToRegExp(value);
    const files = await walk('content');
    return files
      .map((file) => file.split(path.sep).join('/'))
      .filter((file) => matcher.test(file))
      .sort();
  }

  const changed = new Set<string>();

  try {
    const { stdout } = await execFileAsync('git', ['diff', '--name-only', '--diff-filter=ACMRT', 'HEAD']);
    stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => CONTENT_FILE_PATTERN.test(line))
      .forEach((line) => changed.add(line));
  } catch {
    // Fall back to untracked files below.
  }

  try {
    const { stdout } = await execFileAsync('git', ['ls-files', '--others', '--exclude-standard']);
    stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => CONTENT_FILE_PATTERN.test(line))
      .forEach((line) => changed.add(line));
  } catch {
    // Ignore when git metadata is unavailable.
  }

  return [...changed].sort();
}

export async function readInputFiles(files: string[]) {
  return Promise.all(
    files.map(async (file) => ({
      file,
      content: await readFile(file, 'utf8'),
    }))
  );
}
