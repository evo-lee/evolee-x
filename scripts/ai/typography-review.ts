#!/usr/bin/env node --import tsx

import { runTool } from '@/scripts/ai/shared/run-tool';

void runTool({
  tool: 'typography-review',
  promptPath: 'prompts/typography-review.md',
  systemPrompt:
    'You are reviewing long-form mixed Chinese-English technical writing for paragraph flow, heading hierarchy, punctuation consistency, and readability.',
}).catch((error) => {
  console.error('[ai:typography-review] Failed');
  console.error(error);
  process.exit(1);
});
