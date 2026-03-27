import { z } from 'zod';
import type { AISuggestion } from '@/scripts/ai/shared/types';

export const suggestionSchema = z.object({
  file: z.string(),
  title: z.string(),
  detail: z.string(),
  severity: z.enum(['info', 'warning', 'error']),
  line: z.number().int().positive().optional(),
});

export const modelOutputSchema = z.object({
  summary: z.string(),
  suggestions: z.array(suggestionSchema),
});

export type ModelOutput = z.infer<typeof modelOutputSchema>;

export function validateModelOutput(value: unknown): {
  summary: string;
  suggestions: AISuggestion[];
} {
  return modelOutputSchema.parse(value);
}
