import test from "node:test";
import assert from "node:assert/strict";
import { buildCoreRules, fallbackResponseTemplates } from "../core-rules.ts";
import { rankArticlesByIntent } from "../intent-ranking.ts";
import type { ArticleContext } from "../types.ts";

function createArticle(params: {
  title: string;
  categories: string[];
  summary: string;
  keyPoints: string[];
  daysAgo?: number;
}): ArticleContext {
  return {
    title: params.title,
    url: `https://luolei.org/${encodeURIComponent(params.title)}`,
    categories: params.categories,
    summary: params.summary,
    keyPoints: params.keyPoints,
    dateTime: Date.now() - (params.daysAgo ?? 30) * 24 * 60 * 60 * 1000,
  };
}

const articlePool: ArticleContext[] = [
  createArticle({
    title: "AI 分身架构实战：RAG 与 Agent",
    categories: ["code", "ai"],
    summary: "从 embedding 到 RAG 检索，再到 Agent 对话编排。",
    keyPoints: ["LLM", "Prompt", "向量检索"],
    daysAgo: 5,
  }),
  createArticle({
    title: "Cloudflare + Wrangler + Docker 的 Homelab 运维实践",
    categories: ["code", "devops"],
    summary: "通过 cloudflare、wrangler、openwrt 组合构建家庭实验室。",
    keyPoints: ["Prometheus", "Nginx", "OpenWrt"],
    daysAgo: 20,
  }),
  createArticle({
    title: "Next.js 与 React 全栈 SEO 指南",
    categories: ["code", "frontend"],
    summary: "围绕 nextjs、react、typescript 的 SEO 与渲染策略。",
    keyPoints: ["TS", "SSR", "Metadata"],
    daysAgo: 40,
  }),
  createArticle({
    title: "东京晨跑与镰仓摄影旅行",
    categories: ["travel", "photography"],
    summary: "东京、镰仓、香港徒步与摄影记录。",
    keyPoints: ["旅行", "摄影", "马拉松"],
    daysAgo: 60,
  }),
  createArticle({
    title: "深圳医院验光与眼镜消费体验",
    categories: ["lifestyle"],
    summary: "医院验光流程、眼镜消费和生活方式体验复盘。",
    keyPoints: ["眼镜", "医院", "消费体验"],
    daysAgo: 15,
  }),
  createArticle({
    title: "随手记：与主题无关的杂谈",
    categories: ["misc"],
    summary: "没有明显关键词。",
    keyPoints: ["随笔"],
    daysAgo: 10,
  }),
];

test("core rules should include mandatory contracts and fixed templates", () => {
  const rules = buildCoreRules();

  assert.match(rules, /来源限制协议/);
  assert.match(rules, /数字协议/);
  assert.match(rules, /履历协议/);
  assert.match(rules, /链接协议/);

  assert.match(rules, new RegExp(fallbackResponseTemplates.missingProfile));
  assert.match(rules, new RegExp(fallbackResponseTemplates.missingNumber));
  assert.match(rules, new RegExp(fallbackResponseTemplates.emptySearch));
  assert.match(rules, new RegExp(fallbackResponseTemplates.searchGuidance));

  assert.equal((rules.match(/来源限制协议/g) ?? []).length, 1);
  assert.equal((rules.match(/数字协议/g) ?? []).length, 1);
  assert.equal((rules.match(/履历协议/g) ?? []).length, 1);
  assert.equal((rules.match(/链接协议/g) ?? []).length, 1);
  assert.match(rules, /禁止输出内部证据编号（如 A1、T1、\[A、\[T）/);
});

test("intent ranking should be stable and relevant for 10 typical queries", () => {
  const cases = [
    { query: "RAG 数字分身 agent 怎么做", expectedTop: "AI 分身架构实战：RAG 与 Agent" },
    { query: "cloudflare wrangler docker 运维", expectedTop: "Cloudflare + Wrangler + Docker 的 Homelab 运维实践" },
    { query: "Next.js React TS SEO", expectedTop: "Next.js 与 React 全栈 SEO 指南" },
    { query: "东京 旅行 摄影", expectedTop: "东京晨跑与镰仓摄影旅行" },
    { query: "眼镜 医院 体验", expectedTop: "深圳医院验光与眼镜消费体验" },
    { query: "推荐 react ts 文章", expectedTop: "Next.js 与 React 全栈 SEO 指南" },
    { query: "openwrt nginx homelab", expectedTop: "Cloudflare + Wrangler + Docker 的 Homelab 运维实践" },
    { query: "LLM prompt embedding", expectedTop: "AI 分身架构实战：RAG 与 Agent" },
    { query: "香港 徒步 跑步", expectedTop: "东京晨跑与镰仓摄影旅行" },
    { query: "消费体验 生活方式", expectedTop: "深圳医院验光与眼镜消费体验" },
  ] as const;

  for (const item of cases) {
    const { rankedArticles } = rankArticlesByIntent({
      query: item.query,
      articles: articlePool,
      enabled: true,
    });

    assert.equal(rankedArticles[0]?.title, item.expectedTop, `query: ${item.query}`);
  }
});

test("unknown intent should fallback to original article order", () => {
  const baseline = [articlePool[2], articlePool[0], articlePool[1]];
  const { intent, rankedArticles } = rankArticlesByIntent({
    query: "今天心情如何",
    articles: baseline,
    enabled: true,
  });

  assert.equal(intent, "unknown");
  assert.deepEqual(
    rankedArticles.map((item) => item.title),
    baseline.map((item) => item.title),
  );
});
