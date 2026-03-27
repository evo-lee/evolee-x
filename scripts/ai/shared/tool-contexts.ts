import type { AIReviewTool, ToolContext } from '@/scripts/ai/shared/types';

export const AI_TOOL_CONTEXTS: Record<AIReviewTool, ToolContext> = {
  proofread: {
    tool: 'proofread',
    promptPath: 'prompts/proofread.md',
    systemPrompt:
      'You are reviewing content files for spelling, grammar, punctuation style, and wording clarity. Prefer concise, reviewable suggestions and do not rewrite entire articles.',
  },
  summarize: {
    tool: 'summarize',
    promptPath: 'prompts/summarize.md',
    systemPrompt:
      'You are reviewing or proposing concise article summaries for frontmatter. Keep suggestions factual, short, and faithful to the source content.',
  },
  'seo-suggest': {
    tool: 'seo-suggest',
    promptPath: 'prompts/seo-suggest.md',
    systemPrompt:
      'You are reviewing article metadata quality and suggesting better seoTitle or seoDescription values when needed. Keep suggestions concrete and bounded.',
  },
  'typography-review': {
    tool: 'typography-review',
    promptPath: 'prompts/typography-review.md',
    systemPrompt:
      'You are reviewing long-form mixed Chinese-English technical writing for paragraph flow, heading hierarchy, punctuation consistency, and readability.',
  },
};
