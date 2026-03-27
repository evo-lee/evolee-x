#!/usr/bin/env node --import tsx

import { runTool } from '@/scripts/ai/shared/run-tool';

void runTool({
  tool: 'summarize',
  promptPath: 'prompts/summarize.md',
  systemPrompt:
    'You are reviewing or proposing concise article summaries for frontmatter. Keep suggestions factual, short, and faithful to the source content.',
}).catch((error) => {
  console.error('[ai:summarize] Failed');
  console.error(error);
  process.exit(1);
});
