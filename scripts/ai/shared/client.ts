import { loadEnvConfig } from '@next/env';
import { readFile } from 'fs/promises';
import type { AIProvider, ToolContext } from '@/scripts/ai/shared/types';
import { validateModelOutput } from '@/scripts/ai/shared/schema-validator';

loadEnvConfig(process.cwd());

const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest';
const DEFAULT_ANTHROPIC_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

type ProviderConfig = {
  provider: AIProvider;
  model: string;
  baseUrl: string;
  apiKey: string;
};

type AnthropicPrompt = {
  system: string;
  user: string;
};

function normalizeBaseUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function resolveProviderConfig(): ProviderConfig {
  const rawProvider = process.env.AI_PROVIDER || 'anthropic';

  if (rawProvider !== 'anthropic' && rawProvider !== 'openai') {
    throw new Error('AI_PROVIDER must be either "anthropic" or "openai".');
  }

  const provider = rawProvider as AIProvider;

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai.');
    }

    return {
      provider,
      apiKey,
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      baseUrl: normalizeBaseUrl(process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic.');
  }

  return {
    provider: 'anthropic',
    apiKey,
    model: process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
    baseUrl: normalizeBaseUrl(process.env.ANTHROPIC_BASE_URL || DEFAULT_ANTHROPIC_BASE_URL),
  };
}

async function parseJsonResponse(response: Response) {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Provider request failed (${response.status}): ${detail}`);
  }

  return response.json();
}

function extractTextFromOpenAIContent(content: unknown): string {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (
          item &&
          typeof item === 'object' &&
          'type' in item &&
          item.type === 'text' &&
          'text' in item &&
          typeof item.text === 'string'
        ) {
          return item.text;
        }

        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

async function requestAnthropicCompletion(
  config: ProviderConfig,
  prompt: AnthropicPrompt,
  payload: string
) {
  const response = await fetch(`${config.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1600,
      system: `${prompt.system}\n\nReturn valid JSON only with keys: summary, suggestions.`,
      messages: [
        {
          role: 'user',
          content: `${prompt.user}\n\n${payload}`,
        },
      ],
    }),
  });

  const json = (await parseJsonResponse(response)) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  return (json.content || [])
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text as string)
    .join('\n')
    .trim();
}

async function requestOpenAICompletion(config: ProviderConfig, prompt: string, payload: string) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: `${prompt}\n\nReturn valid JSON only with keys: summary, suggestions.`,
        },
        {
          role: 'user',
          content: payload,
        },
      ],
    }),
  });

  const json = (await parseJsonResponse(response)) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  return extractTextFromOpenAIContent(json.choices?.[0]?.message?.content);
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
  const config = resolveProviderConfig();
  const prompt = await loadPrompt(promptPath);
  const userPayload = `${prompt}\n\n${payload}`;

  const text =
    config.provider === 'openai'
      ? await requestOpenAICompletion(config, systemPrompt, userPayload)
      : await requestAnthropicCompletion(
          config,
          {
            system: systemPrompt,
            user: prompt,
          },
          payload
        );

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
