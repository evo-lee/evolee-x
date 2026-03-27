export type ExecutionMode = 'file' | 'glob' | 'changed-files';

export type AIReviewTool =
  | 'proofread'
  | 'summarize'
  | 'seo-suggest'
  | 'typography-review';

export type SuggestionSeverity = 'info' | 'warning' | 'error';

export interface AISuggestion {
  file: string;
  title: string;
  detail: string;
  severity: SuggestionSeverity;
  line?: number;
}

export interface AIReport {
  tool: AIReviewTool;
  mode: ExecutionMode;
  dryRun: boolean;
  generatedAt: string;
  files: string[];
  suggestions: AISuggestion[];
  summary: string;
}

export interface ToolContext {
  tool: AIReviewTool;
  promptPath: string;
  systemPrompt: string;
}

export interface ToolCliOptions {
  mode: ExecutionMode;
  value?: string;
  dryRun: boolean;
}
