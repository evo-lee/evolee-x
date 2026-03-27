#!/usr/bin/env node --import tsx

import { runTool } from '@/scripts/ai/shared/run-tool';

void runTool({
  tool: 'seo-suggest',
  promptPath: 'prompts/seo-suggest.md',
  systemPrompt:
    'You are reviewing article metadata quality and suggesting better seoTitle or seoDescription values when needed. Keep suggestions concrete and bounded.',
}).catch((error) => {
  console.error('[ai:seo-suggest] Failed');
  console.error(error);
  process.exit(1);
});
