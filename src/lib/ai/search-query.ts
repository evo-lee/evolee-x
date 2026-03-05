import type { UIMessage } from "ai";

const MAX_QUERY_TOKENS = 12;

const ZH_WORD_SEGMENTER =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("zh-CN", { granularity: "word" })
    : null;

const STOPWORDS = new Set([
  "我",
  "你",
  "他",
  "她",
  "它",
  "我们",
  "你们",
  "他们",
  "这",
  "那",
  "这个",
  "那个",
  "这些",
  "那些",
  "这里",
  "那里",
  "吗",
  "呢",
  "吧",
  "呀",
  "啊",
  "么",
  "的",
  "了",
  "是",
  "在",
  "和",
  "与",
  "及",
  "或",
  "还",
  "就",
  "都",
  "也",
  "又",
  "再",
  "给",
  "把",
  "被",
  "从",
  "到",
  "对",
  "向",
  "吗",
  "请",
  "帮",
  "一下",
  "一篇",
  "一条",
  "哪些",
  "什么",
  "怎么",
  "如何",
  "有没有",
  "是不是",
  "推荐",
  "文章",
  "动态",
  "博客",
]);

function toSafeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .trim();
}

function isCjkToken(token: string): boolean {
  return /^[\p{Script=Han}]+$/u.test(token);
}

function isStopword(token: string): boolean {
  return STOPWORDS.has(token);
}

function appendToken(target: string[], seen: Set<string>, token: string): void {
  if (!token) return;
  if (token.length <= 1) return;
  if (isStopword(token)) return;
  if (seen.has(token)) return;

  seen.add(token);
  target.push(token);
}

function extractRawWordLikeTokens(text: string): string[] {
  const source = text.trim();
  if (!source) return [];

  const tokens: string[] = [];
  if (ZH_WORD_SEGMENTER) {
    for (const segment of ZH_WORD_SEGMENTER.segment(source)) {
      if (!segment.isWordLike) continue;
      const token = toSafeToken(segment.segment);
      if (!token) continue;
      tokens.push(token);
    }
  } else {
    const cjkMatches = source.match(/[\u4e00-\u9fff]+/g) ?? [];
    for (const match of cjkMatches) {
      const token = toSafeToken(match);
      if (token) tokens.push(token);
    }
  }

  const latinMatches = source.match(/[a-zA-Z0-9][a-zA-Z0-9.+#-]{1,}/g) ?? [];
  for (const match of latinMatches) {
    const token = toSafeToken(match);
    if (token) tokens.push(token);
  }

  return tokens;
}

interface ExtractTokenOptions {
  includeJoinedCjk?: boolean;
}

export function extractSearchTokens(
  text: string,
  maxTokens = MAX_QUERY_TOKENS,
  options: ExtractTokenOptions = {},
): string[] {
  const includeJoinedCjk = options.includeJoinedCjk ?? true;
  const rawTokens = extractRawWordLikeTokens(text);
  const tokens: string[] = [];
  const seen = new Set<string>();

  for (const token of rawTokens) {
    appendToken(tokens, seen, token);
    if (tokens.length >= maxTokens) return tokens;
  }

  if (!includeJoinedCjk) {
    return tokens;
  }

  // Join adjacent CJK segments to repair cases like "马拉" + "松" => "马拉松".
  for (let i = 0; i < rawTokens.length - 1; i += 1) {
    const current = rawTokens[i];
    const next = rawTokens[i + 1];
    if (!isCjkToken(current) || !isCjkToken(next)) continue;
    if (isStopword(current) || isStopword(next)) continue;

    const joined = `${current}${next}`;
    if (joined.length < 2 || joined.length > 8) continue;
    appendToken(tokens, seen, joined);
    if (tokens.length >= maxTokens) return tokens;
  }

  return tokens;
}

export function buildSearchQuery(text: string): string {
  return extractSearchTokens(text, MAX_QUERY_TOKENS, { includeJoinedCjk: true }).join(" ");
}

export function getMessageText(message: Omit<UIMessage, "id">): string {
  if (!message.parts) return "";
  const textPart = message.parts.find((p) => p.type === "text");
  return textPart && "text" in textPart ? textPart.text : "";
}

export function buildLocalSearchQuery(messages: Array<Omit<UIMessage, "id">>): string {
  const userTexts = messages
    .filter((message) => message.role === "user")
    .map(getMessageText)
    .map((text) => text.trim())
    .filter(Boolean);

  if (userTexts.length === 0) return "";
  const latest = userTexts[userTexts.length - 1] ?? "";
  return buildSearchQuery(latest);
}

export function hasSearchQueryOverlap(currentQuery: string, cachedQuery: string): boolean {
  const currentTokens = extractSearchTokens(currentQuery, MAX_QUERY_TOKENS, {
    includeJoinedCjk: false,
  });
  const cachedTokens = extractSearchTokens(cachedQuery, MAX_QUERY_TOKENS, {
    includeJoinedCjk: false,
  });

  if (currentTokens.length === 0 || cachedTokens.length === 0) return false;

  const cachedSet = new Set(cachedTokens);
  let overlapCount = 0;
  for (const token of currentTokens) {
    if (cachedSet.has(token)) {
      overlapCount += 1;
    }
  }

  if (currentTokens.length <= 2) return overlapCount >= 1;
  return overlapCount / currentTokens.length >= 0.4;
}

export function hasNewSignificantTokens(currentQuery: string, cachedQuery: string): boolean {
  const currentTokens = extractSearchTokens(currentQuery, MAX_QUERY_TOKENS, {
    includeJoinedCjk: false,
  });
  const cachedSet = new Set(
    extractSearchTokens(cachedQuery, MAX_QUERY_TOKENS, { includeJoinedCjk: false }),
  );
  if (currentTokens.length === 0 || cachedSet.size === 0) return false;

  for (const token of currentTokens) {
    if (!cachedSet.has(token)) {
      return true;
    }
  }
  return false;
}
