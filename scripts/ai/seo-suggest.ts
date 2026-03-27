#!/usr/bin/env node --import tsx

import { runTool } from '@/scripts/ai/shared/run-tool';
import { AI_TOOL_CONTEXTS } from '@/scripts/ai/shared/tool-contexts';

void runTool(AI_TOOL_CONTEXTS['seo-suggest']).catch((error) => {
  console.error('[ai:seo-suggest] Failed');
  console.error(error);
  process.exit(1);
});
