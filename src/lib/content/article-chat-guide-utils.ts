export interface ArticleChatGuideInput {
  title: string;
  categories?: string[];
  summary?: string;
  abstract?: string;
  keyPoints?: string[];
}

export interface GeneratedArticleChatGuide {
  openingLine?: unknown;
  focusQuestions?: unknown;
  extensionTopics?: unknown;
}

export interface ArticleChatGuideContent {
  openingLine: string;
  focusQuestions: string[];
  extensionTopics: string[];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function toGuideCandidateArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[？?])\s*/u))
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeLine(value: unknown): string {
  return String(value ?? "")
    .replace(/^\s*[-*•]\s*/u, "")
    .replace(/^\s*\d+[.)、]\s*/u, "")
    .replace(/^["'“”‘’`]+|["'“”‘’`]+$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureSentence(value: unknown): string {
  const cleaned = normalizeLine(value).replace(/[。！？!?]+$/u, "").trim();
  return cleaned ? `${cleaned}。` : "";
}

function ensureQuestion(value: unknown): string {
  const cleaned = normalizeLine(value)
    .replace(/^(建议问题|推荐问题|问题|追问|延伸问题|延伸话题)[:：]\s*/u, "")
    .replace(/[。！!；;]+$/u, "")
    .trim();

  if (!cleaned) return "";
  return /[？?]$/u.test(cleaned) ? cleaned : `${cleaned}？`;
}

export function normalizeGuideOpeningLine(value: unknown): string {
  const sentence = ensureSentence(value);
  if (!sentence) return "";
  if (sentence.length > 36) return "";
  if (/盘盘|掰扯|前女友|也太|抄.*作业/u.test(sentence)) return "";
  return sentence;
}

export function normalizeGuideQuestions(values: unknown, limit = 3): string[] {
  return uniqueStrings(toGuideCandidateArray(values).map(ensureQuestion).filter(Boolean)).slice(
    0,
    limit,
  );
}

export function normalizeGuideTopics(values: unknown, limit = 2): string[] {
  return uniqueStrings(toGuideCandidateArray(values).map(ensureQuestion).filter(Boolean)).slice(
    0,
    limit,
  );
}

export function buildArticleChatGuideContent(
  _input: ArticleChatGuideInput,
  generated?: GeneratedArticleChatGuide,
): ArticleChatGuideContent {
  const fallbackFocusQuestions = [
    "这篇文章最值得先抓住的重点是什么？",
    "文里最值得继续展开的细节是哪一块？",
    "如果我想顺着这篇继续问，最该从哪里开始？",
  ];
  const fallbackExtensionTopics = [
    "这篇和站里哪几篇内容适合一起看？",
    "如果想顺着这篇继续聊，还能展开什么？",
  ];

  const normalizedFocusQuestions = normalizeGuideQuestions(
    generated?.focusQuestions ?? [],
    3,
  );
  const normalizedExtensionTopics = normalizeGuideTopics(
    generated?.extensionTopics ?? [],
    2,
  );

  return {
    openingLine:
      normalizeGuideOpeningLine(generated?.openingLine) ||
      "我可以先帮你理清这篇文章的主线，再继续聊你关心的细节。",
    focusQuestions: uniqueStrings([
      ...normalizedFocusQuestions,
      ...fallbackFocusQuestions,
    ]).slice(0, 3),
    extensionTopics: uniqueStrings([
      ...normalizedExtensionTopics,
      ...fallbackExtensionTopics,
    ]).slice(0, 2),
  };
}
