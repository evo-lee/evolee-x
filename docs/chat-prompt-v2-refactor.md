# Chat Prompt v2 重构说明

## 目标

将首页 AI 分身 prompt 从单体字符串重构为分层结构，降低 token 成本并提升规则可执行性与推荐稳定性。

## 实现

### 1. 分层 Prompt

新增目录：`src/lib/chat-prompts/`

- `core-identity.ts`：稳定人格与边界
- `core-rules.ts`：可执行反幻觉协议与固定拒答模板
- `runtime-context.ts`：动态上下文（authorBio + 相关文章 + 推文）
- `intent-ranking.ts`：轻量意图分类与排序
- `legacy-v1.ts`：保留旧版 prompt
- `index.ts`：导出 `buildSystemPromptV2`

兼容入口：`src/lib/ai/chat-prompt.ts`

- `buildSystemPrompt()` 保持原有调用方式
- 通过 `CHAT_PROMPT_VERSION=v2` 启用新版本

### 2. 反幻觉规则升级

`core-rules.ts` 将规则压缩为 4 个协议：

- 来源限制协议
- 数字协议
- 履历协议
- 链接协议

并增加“输出前检查”流程（仅心里执行，不输出），内置固定拒答模板：

- `这个细节我没在博客里记录。`
- `具体数字我记不太清了，你可以去我博客里那篇文章里确认一下。`
- `我这次没搜到直接相关的文章/动态。`

### 3. Runtime Context 优化

- authorBio 改为结构化输出（身份/坐标/社交/经历/技能/亮点）
- 经验描述按中文优先断句，避免 `Node.js` 等英文小数点误截断
- 高亮项敏感词过滤支持配置
- 相关文章/推文改紧凑格式，减少 token

### 4. 意图排序

在不改召回逻辑的前提下，对检索结果做二次重排：

- 意图分类：`ai_rag` / `devops_homelab` / `frontend_fullstack` / `photo_travel` / `lifestyle` / `unknown`
- 打分权重：title +3、categories +2、summary +2、keyPoints +1、近期 +1
- `unknown` 保持原顺序（fallback）

### 5. 检索 Query 稳定性增强（补丁）

为修复中文口语问法（如“长沙和珠海马拉松呢”）在检索阶段的漏召回，新增：

- `src/lib/ai/search-query.ts`
  - 本地 query 归一化（分词 + 停用词过滤 + CJK 相邻拼接修复）
  - 修复 `马拉 + 松` 等分词碎片，补全为 `马拉松`
  - 新实体检测（用于复用检索上下文判定）
- `src/app/api/chat/route.ts`
  - 关键词模型输出先做本地归一化，再用于搜索
  - 搜索 0 命中时自动回退到本地 query 重新检索
  - 追问出现新实体词时，禁止复用旧检索上下文并强制重检索

## 配置项

通过环境变量控制：

- `CHAT_PROMPT_VERSION=v1|v2`
- `MAX_EXPERIENCE_LINES`
- `MAX_SOCIAL_LINKS`
- `MAX_HIGHLIGHTS`
- `MAX_ARTICLES_IN_PROMPT`
- `MAX_TWEETS_IN_PROMPT`
- `ENABLE_INTENT_RANKING=true|false`
- `SENSITIVE_HIGHLIGHT_PATTERNS`（逗号分隔）

## 测试

新增测试：`src/lib/chat-prompts/__tests__/prompt-v2.test.ts`
新增测试：`src/lib/ai/__tests__/search-query.test.ts`

覆盖：

- Core rules 关键协议与模板字符串断言
- 10 条典型 query 的排序稳定性断言
- unknown 意图 fallback 顺序断言

运行：

```bash
pnpm test:chat-prompt
pnpm test:ai-search
```
