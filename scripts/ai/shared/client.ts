import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import type { ToolContext } from '@/scripts/ai/shared/types';
import { validateModelOutput } from '@/scripts/ai/shared/schema-validator';

const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required.');
  }

  return new Anthropic({ apiKey, timeout: 30_000, maxRetries: 2 });
}

export async function loadPrompt(pathname: string) {
  return readFile(pathname, 'utf8');
}

export async function requestSuggestions({
  tool,
  promptPath,
  systemPrompt,
  payload,
}: ToolContext & {
  payload: string;
}) {
  const client = getClient();
  const prompt = await loadPrompt(promptPath);

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1600,
    system: `${systemPrompt}\n\nReturn valid JSON only with keys: summary, suggestions.`,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\n${payload}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error(`[${tool}] Model returned empty output.`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`[${tool}] Model output was not valid JSON: ${(error as Error).message}`);
  }

  return validateModelOutput(parsed);
}
