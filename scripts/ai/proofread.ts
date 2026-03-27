#!/usr/bin/env node --import tsx

import { runTool } from '@/scripts/ai/shared/run-tool';

void runTool({
  tool: 'proofread',
  promptPath: 'prompts/proofread.md',
  systemPrompt:
    'You are reviewing content files for spelling, grammar, punctuation style, and wording clarity. Prefer concise, reviewable suggestions and do not rewrite entire articles.',
}).catch((error) => {
  console.error('[ai:proofread] Failed');
  console.error(error);
  process.exit(1);
});
