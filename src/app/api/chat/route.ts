import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type FinishReason,
  type UIMessage,
} from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { buildSystemPrompt } from "@/lib/ai/chat-prompt";
import { parseChatRequestContext } from "@/lib/ai/chat-context";
import {
  resolveChatSearchState,
  resolveCurrentArticleState,
} from "@/lib/ai/chat-route";
import {
  buildEvidenceAnalysisSection,
  analyzeRetrievedEvidence,
  shouldSkipAnalysis,
} from "@/lib/ai/evidence-analysis";
import { createChatStatusData } from "@/lib/ai/chat-status";
import {
  classifyUpstreamError,
  createRequestId,
  durationMs,
  logChatAIDebug,
  mergeTokenUsage,
  parsePositiveIntEnv,
  summarizeError,
  toTokenUsageStats,
  truncateForLog,
  truncateRawTextForLog,
} from "@/lib/ai/chat-utils";
import {
  createCitationGuardTransform,
  getCitationGuardPreflight,
  type CitationGuardAction,
} from "@/lib/ai/citation-guard";
import { buildLocalSearchQuery, getMessageText } from "@/lib/ai/search-query";
import { getClientIP, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import {
  sendChatNotification,
  type RequestTimingStats,
  type TokenUsageStats,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

const MAX_HISTORY_MESSAGES = 20;
const MAX_INPUT_LENGTH = 500;
const EVIDENCE_ANALYSIS_TIMEOUT_MS = parsePositiveIntEnv(
  process.env.EVIDENCE_ANALYSIS_TIMEOUT_MS,
  8000,
);
const EVIDENCE_ANALYSIS_MAX_OUTPUT_TOKENS = parsePositiveIntEnv(
  process.env.EVIDENCE_ANALYSIS_MAX_OUTPUT_TOKENS,
  360,
);
const CURRENT_ARTICLE_FULL_CONTENT_MAX_LENGTH = parsePositiveIntEnv(
  process.env.CURRENT_ARTICLE_FULL_CONTENT_MAX_LENGTH,
  12000,
);

export async function POST(req: Request) {
  const requestStart = performance.now();
  const requestId = createRequestId();
  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck);
  }

  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!baseUrl || !apiKey || !model) {
    return Response.json(
      { error: "AI 服务未配置" },
      { status: 503 },
    );
  }
  const keywordModel = process.env.AI_KEYWORD_MODEL || model;

  let body: { messages?: UIMessage[]; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "请求格式错误" },
      { status: 400 },
    );
  }

  const messages = (body.messages ?? []).slice(-MAX_HISTORY_MESSAGES);
  if (messages.length === 0) {
    return Response.json(
      { error: "消息不能为空" },
      { status: 400 },
    );
  }

  const latestText = getMessageText(messages[messages.length - 1]);
  const requestContext = parseChatRequestContext(body.context);
  const {
    currentArticle,
    articleConversationQuery,
    articleEvidenceQuery,
    articleIntentDecision,
    shouldUseArticleScopedFlow,
  } = resolveCurrentArticleState({
    messages,
    requestContext,
    fullContentMaxLength: CURRENT_ARTICLE_FULL_CONTENT_MAX_LENGTH,
  });

  if (latestText.length > MAX_INPUT_LENGTH) {
    return Response.json(
      { error: `消息过长，最多 ${MAX_INPUT_LENGTH} 字` },
      { status: 400 },
    );
  }

  const provider = createOpenAICompatible({
    name: "blog-chat",
    baseURL: baseUrl,
    apiKey,
    includeUsage: true,
  });
  logChatAIDebug(requestId, "request.received", {
    latestText: truncateForLog(latestText),
    articleConversationQuery: truncateForLog(articleConversationQuery || latestText),
    articleEvidenceQuery: truncateForLog(articleEvidenceQuery || latestText),
    messageCount: messages.length,
    model,
    keywordModel,
  });

  const localSearchQuery = buildLocalSearchQuery(messages);
  const {
    searchQuery,
    relatedArticles,
    relatedTweets,
    relatedProjects,
    keywordUsage,
    keywordExtractionMs,
    searchMs,
    queryComplexity,
    shouldReuseSearchContext,
  } = await resolveChatSearchState({
    req,
    requestId,
    messages,
    latestText,
    currentArticle,
    articleIntentDecision,
    shouldUseArticleScopedFlow,
    localSearchQuery,
    keywordModel,
    provider,
  });

  const baseSystemPrompt = buildSystemPrompt(
    relatedArticles,
    relatedTweets,
    currentArticle ? articleEvidenceQuery || latestText : articleConversationQuery || latestText,
    relatedProjects,
    currentArticle,
  );

  const evidenceModel = process.env.AI_EVIDENCE_MODEL || keywordModel;
  let evidenceAnalysisSection = "";
  let evidenceUsage: TokenUsageStats | undefined;
  let evidenceAnalysisMs: number | undefined;
  let evidenceParseStatus = "";

  const skipAnalysis =
    shouldUseArticleScopedFlow ||
    shouldSkipAnalysis(latestText, relatedArticles.length, relatedTweets.length);
  if (!skipAnalysis) {
    const evidenceStart = performance.now();
    const evidenceAbortController = new AbortController();
    const evidenceTimeoutId = setTimeout(
      () => evidenceAbortController.abort(),
      EVIDENCE_ANALYSIS_TIMEOUT_MS,
    );
    try {
      const evidenceResult = await analyzeRetrievedEvidence({
        messages,
        searchQuery,
        articles: relatedArticles,
        tweets: relatedTweets,
        provider,
        model: evidenceModel,
        maxOutputTokens: EVIDENCE_ANALYSIS_MAX_OUTPUT_TOKENS,
        complexity: queryComplexity,
        abortSignal: evidenceAbortController.signal,
      });
      evidenceUsage = evidenceResult.usage;
      evidenceParseStatus = evidenceResult.parseStatus;
      if (evidenceResult.analysis) {
        const sourceTitleByUrl = new Map<string, string>();
        for (const article of relatedArticles) {
          sourceTitleByUrl.set(article.url, article.title);
        }
        for (const tweet of relatedTweets) {
          sourceTitleByUrl.set(tweet.url, tweet.title);
        }
        evidenceAnalysisSection = buildEvidenceAnalysisSection(
          evidenceResult.analysis,
          sourceTitleByUrl,
        );
      }
      logChatAIDebug(requestId, "evidence-analysis.result", {
        parseStatus: evidenceResult.parseStatus,
        hasSection: evidenceAnalysisSection.length > 0,
        sectionLength: evidenceAnalysisSection.length,
        rawTextLength: evidenceResult.rawText?.length,
        rawText: evidenceResult.rawText
          ? truncateRawTextForLog(evidenceResult.rawText)
          : undefined,
        error: evidenceResult.error,
      });
    } catch (error) {
      logChatAIDebug(requestId, "evidence-analysis.error", {
        error: summarizeError(error),
      });
    } finally {
      clearTimeout(evidenceTimeoutId);
    }
    evidenceAnalysisMs = durationMs(evidenceStart);
  } else {
    logChatAIDebug(requestId, "evidence-analysis.skipped", {
      reason: shouldUseArticleScopedFlow ? "article_scoped_flow" : "skip_analysis",
      articleCount: relatedArticles.length,
      tweetCount: relatedTweets.length,
    });
  }

  const finalSystemPrompt = evidenceAnalysisSection
    ? `${baseSystemPrompt}\n\n${evidenceAnalysisSection}`
    : baseSystemPrompt;
  const citationGuardPreflight = getCitationGuardPreflight({
    userQuery: latestText,
    articles: relatedArticles,
    tweets: relatedTweets,
    projects: relatedProjects,
  });
  if (citationGuardPreflight) {
    logChatAIDebug(requestId, "citation-guard.preflight", {
      actions: citationGuardPreflight.actions,
      responsePreview: truncateForLog(citationGuardPreflight.text),
    });
  }

  try {
    let baseResponseText = "";
    let chatCompletionUsage: TokenUsageStats | undefined;
    let promptBuildMs: number | undefined;
    let streamFinishReason: FinishReason | undefined;
    let streamRawFinishReason: string | undefined;
    let citationGuardActions: CitationGuardAction[] = citationGuardPreflight?.actions ?? [];

    const stream = createUIMessageStream<UIMessage>({
      originalMessages: messages,
      execute: async ({ writer }) => {
        const articleCount = relatedArticles.length + relatedTweets.length;

        if (shouldUseArticleScopedFlow && currentArticle) {
          writer.write({
            type: "message-metadata",
            messageMetadata: createChatStatusData({
              stage: "search",
              message: "正在结合当前文章全文回答",
              progress: 40,
            }),
          });
        } else if (articleCount > 0) {
          writer.write({
            type: "message-metadata",
            messageMetadata: createChatStatusData({
              stage: "search",
              message: `找到 ${articleCount} 篇相关内容`,
              progress: 40,
            }),
          });
        }

        if (citationGuardPreflight) {
          streamFinishReason = "stop";
          streamRawFinishReason = "citation_guard_preflight";
          baseResponseText = citationGuardPreflight.text;
          writer.write({
            type: "message-metadata",
            messageMetadata: createChatStatusData({
              stage: "answer",
              message: "已基于公开记录直接给出回答",
              progress: 100,
            }),
          });
          writer.write({
            type: "text-start",
            id: `citation-guard-${requestId}`,
          });
          writer.write({
            type: "text-delta",
            id: `citation-guard-${requestId}`,
            delta: citationGuardPreflight.text,
          });
          writer.write({
            type: "text-end",
            id: `citation-guard-${requestId}`,
          });
          writer.write({
            type: "finish",
            finishReason: streamFinishReason,
          });
          return;
        }

        const promptBuildStart = performance.now();
        const systemPrompt = finalSystemPrompt;
        promptBuildMs = durationMs(promptBuildStart);
        logChatAIDebug(requestId, "prompt.summary", {
          systemPromptLength: systemPrompt.length,
          hasEvidenceAnalysisSection: evidenceAnalysisSection.length > 0,
        });

        writer.write({
          type: "message-metadata",
          messageMetadata: createChatStatusData({
            stage: "answer",
            message: "正在生成回答...",
            progress: 60,
          }),
        });

        const result = streamText({
          model: provider.chatModel(model),
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
          temperature: 0.3,
          maxOutputTokens: 2500,
          experimental_transform: createCitationGuardTransform({
            userQuery: articleConversationQuery || latestText,
            articles: relatedArticles,
            tweets: relatedTweets,
            projects: relatedProjects,
            onApplied: (guardResult) => {
              citationGuardActions = guardResult.actions;
            },
          }),
          onFinish: ({ text, totalUsage, finishReason, rawFinishReason }) => {
            baseResponseText = text;
            chatCompletionUsage = toTokenUsageStats(totalUsage);
            streamFinishReason = finishReason;
            streamRawFinishReason = rawFinishReason;
            logChatAIDebug(requestId, "chat-model.finish", {
              finishReason,
              rawFinishReason,
              responsePreview: truncateForLog(text),
              responseLength: text.length,
            });
          },
        });

        writer.merge(
          result.toUIMessageStream({
            sendFinish: false,
          }),
        );
        await result.consumeStream({ onError: writer.onError });

        writer.write({
          type: "finish",
          finishReason: streamFinishReason,
        });
      },
      onFinish: async ({ responseMessage }) => {
        const finalResponseText = getMessageText(responseMessage) || baseResponseText;
        const totalTokenUsage = mergeTokenUsage(
          mergeTokenUsage(keywordUsage, evidenceUsage),
          chatCompletionUsage,
        );
        const timings: RequestTimingStats = {
          totalMs: durationMs(requestStart),
          keywordExtractionMs,
          evidenceAnalysisMs,
          searchMs,
          promptBuildMs,
          reusedSearchContext: shouldReuseSearchContext,
        };

        await sendChatNotification({
          userIp: ip,
          userMessage: latestText,
          aiResponse: finalResponseText,
          articleTitles: [
            ...relatedArticles.map((article) => `文章 · ${article.title}`),
            ...relatedTweets.map((tweet) => `推文 · ${tweet.title}`),
          ],
          messageCount: messages.length,
          modelConfig: {
            apiBaseUrl: baseUrl,
            chatModel: model,
            keywordModel,
            evidenceModel,
          },
          tokenUsage: {
            total: totalTokenUsage,
            chatCompletion: chatCompletionUsage,
            keywordExtraction: keywordUsage,
            evidenceAnalysis: evidenceUsage,
          },
          timings,
          finishReason: streamFinishReason,
          rawFinishReason: streamRawFinishReason,
        });
        logChatAIDebug(requestId, "request.completed", {
          totalMs: timings.totalMs,
          searchMs,
          keywordExtractionMs,
          evidenceAnalysisMs,
          evidenceParseStatus,
          citationGuardActions,
          hasEvidenceSection: evidenceAnalysisSection.length > 0,
          promptBuildMs,
          finalResponsePreview: truncateForLog(finalResponseText),
        });
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    logChatAIDebug(requestId, "request.failed", {
      detail: truncateForLog(detail, 240),
    });
    const { reason, status } = classifyUpstreamError(detail, model);

    return Response.json(
      { error: reason, detail: detail.slice(0, 200) },
      { status },
    );
  }
}
