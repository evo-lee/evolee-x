import { getChatPromptRuntimeConfig } from "./config.ts";
import { buildCoreIdentity } from "./core-identity.ts";
import { buildCoreRules } from "./core-rules.ts";
import { buildRuntimeContext } from "./runtime-context.ts";
import type { ArticleContext, TweetContext } from "./types.ts";

export type { ArticleContext, TweetContext } from "./types";
export { fallbackResponseTemplates } from "./core-rules";

export function buildSystemPromptV2(
  articles: ArticleContext[],
  tweets: TweetContext[] = [],
  userQuery = "",
): string {
  const config = getChatPromptRuntimeConfig();
  const identity = buildCoreIdentity();
  const rules = buildCoreRules();
  const runtime = buildRuntimeContext({
    articles,
    tweets,
    userQuery,
    config,
  });

  return `${identity}\n\n${rules}\n\n${runtime}`;
}
