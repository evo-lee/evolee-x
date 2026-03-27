#!/usr/bin/env node --import tsx

import { runTool } from '@/scripts/ai/shared/run-tool';
import { AI_TOOL_CONTEXTS } from '@/scripts/ai/shared/tool-contexts';

void runTool(AI_TOOL_CONTEXTS.summarize).catch((error) => {
  console.error('[ai:summarize] Failed');
  console.error(error);
  process.exit(1);
});
