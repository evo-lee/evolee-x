# 个人博客开发架构 v3（Next.js + OpenNext on Cloudflare Workers）

## 1. Document Purpose and Design Goal

Design a production-ready personal blog architecture based on Next.js, deploy it to Cloudflare Workers using the OpenNext Cloudflare adapter, and preserve a Git-based authoring workflow with AI-assisted editorial tooling. The design must remain implementation-friendly for AI coding agents and readable for human reviewers. All normative implementation paragraphs are written in English first, followed immediately by a Chinese translation.

设计一套面向生产可用的个人博客架构：以前端框架 Next.js 为核心，通过 OpenNext Cloudflare 适配器部署到 Cloudflare Workers，并保留基于 Git 的写作工作流与 AI 辅助编辑能力。本文档需要同时满足两类读者：一类是 AI 编程代理，能够据此直接实施；另一类是人类维护者，能够清晰理解设计意图。因此所有规范性描述都采用“先英文、后中文解释”的双语结构。

## 2. Decision Summary

Use Next.js as the application framework, use the OpenNext Cloudflare adapter to transform the Next.js build output for Cloudflare Workers, and deploy the blog as a Worker-first application. Use static generation by default for content-heavy routes, and allow selective dynamic rendering only where the business value clearly justifies it. Do not use Cloudflare Pages as the primary runtime for the full-stack application; reserve Pages only for optional preview or auxiliary static hosting use cases.

本次方案选择 Next.js 作为应用框架，使用 OpenNext Cloudflare 适配器把 Next.js 的构建结果转换为可在 Cloudflare Workers 上运行的部署产物，并以 Worker-first 方式托管整站。对于博客这种以内容为主的站点，页面策略以静态生成优先；只有在确有业务价值时，才允许少量页面使用动态渲染。Cloudflare Pages 不再作为整站全栈运行时的主平台，而只保留为可选的预览环境或辅助静态托管方案。官方当前文档明确支持将 Next.js 应用部署到 Cloudflare Workers，并建议通过 OpenNext Cloudflare 适配器完成转换与部署。([developers.cloudflare.com](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/?utm_source=chatgpt.com))

## 3. Why This Route

Choose this route when you want React-based composition, App Router capabilities, support for static and dynamic rendering in one framework, Cloudflare edge deployment, and a better long-term production baseline than experimental alternatives. This route is preferred over experimental Vite-based reimplementations when stability, tooling compatibility, and operational predictability matter.

当你的目标是同时获得 React 组件化能力、Next.js App Router 的组织方式、静态与动态渲染共存的页面模型，以及 Cloudflare 边缘部署能力时，这条路线是更稳妥的生产基线。相比实验性质更强的替代方案，Next.js + OpenNext on Workers 在稳定性、生态兼容性和运维可预测性方面更适合长期维护。Cloudflare 官方已经把 Next.js on Workers 作为推荐框架路线提供文档，而 OpenNext 也把 Cloudflare 作为正式支持的平台之一。([developers.cloudflare.com](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/?utm_source=chatgpt.com))

## 4. Platform Facts That Shape the Architecture

Cloudflare’s official Next.js on Workers guide states that Next.js applications can be deployed to Workers using the OpenNext adapter. The OpenNext Cloudflare documentation further explains that the adapter transforms standard Next.js build output into a format that runs locally and deploys through the Cloudflare toolchain. The adapter documentation also provides a dedicated CLI and advises against treating raw Wrangler commands as the primary workflow unless explicitly documented.

Cloudflare 官方文档明确说明：Next.js 应用可以通过 OpenNext 适配器部署到 Workers。OpenNext Cloudflare 文档进一步说明，该适配器会把标准 Next.js 构建产物转换为可在本地和 Cloudflare 部署链路中运行的格式。同时，OpenNext 还提供了专门的 CLI，并提示不应把原始 Wrangler 命令作为主要工作流入口，除非文档明确要求或你非常清楚自己在做什么。这个事实直接决定了本架构的实施方式：以标准 Next.js 开发为主，以 OpenNext 负责 Cloudflare 适配和部署转换。([developers.cloudflare.com](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/?utm_source=chatgpt.com))

## 5. Architecture Principles

Keep the content workflow Git-first. Keep runtime dependencies minimal. Use static generation for most blog pages. Keep AI tooling outside the production request path. Treat Cloudflare bindings as explicit infrastructure capabilities, not as hidden global dependencies. Separate deterministic linting from AI-assisted review. Favor predictable build-time metadata over on-request generation.

架构原则如下：内容工作流保持 Git-first；运行时依赖尽量少；绝大多数博客页面采用静态生成；AI 工具严格放在生产请求路径之外；Cloudflare 的各类绑定能力要作为显式基础设施能力来设计，而不是隐式全局依赖；规则类校验与 AI 辅助审查要分离；尽量使用可预测的构建期元数据，而不是把内容质量问题留到请求时再生成或修补。

## 6. High-Level Topology

Use a five-layer model: content layer, application layer, AI editorial layer, deployment layer, and observability layer. The content layer stores Markdown or MDX files in Git. The application layer is a Next.js app using the App Router. The AI editorial layer runs locally or in CI. The deployment layer uses the OpenNext Cloudflare adapter and Cloudflare Workers. The observability layer captures build reports, runtime logs, analytics, and operational alarms.

整体采用五层结构：内容层、应用层、AI 编辑层、部署层、可观测层。内容层负责在 Git 中保存 Markdown 或 MDX 文件；应用层使用 Next.js App Router 实现页面与路由；AI 编辑层只在本地或 CI 中执行；部署层基于 OpenNext Cloudflare 适配器和 Cloudflare Workers；可观测层负责采集构建报告、运行日志、统计指标和异常告警。

```text
Git Repository
├── content/                 # Markdown or MDX posts and pages
├── app/                     # Next.js App Router
├── components/              # React UI components
├── lib/                     # Content loading, SEO, metadata helpers
├── scripts/ai/              # AI editorial tooling
├── prompts/                 # Prompt templates
├── public/                  # Static assets
├── open-next.config.ts      # OpenNext Cloudflare config
└── wrangler.jsonc           # Cloudflare Worker bindings and deploy config
        ↓
Next.js build
        ↓
OpenNext Cloudflare transform
        ↓
Cloudflare Workers deployment
        ↓
Edge delivery + optional bindings (KV/R2/Analytics)
```

## 7. Repository Structure

Use a repository structure optimized for App Router, content-driven pages, and AI-assisted editorial automation. Keep content, generated metadata, prompts, and scripts in clearly separated directories so that an AI coding agent can reason about file responsibilities without guessing.

仓库结构要同时适配 App Router、内容驱动页面和 AI 辅助编辑自动化。内容文件、生成的元数据、提示词和脚本要分目录存放，让 AI 编程代理在理解各文件职责时不需要猜测边界。

```text
blog/
├── app/
│   ├── (site)/
│   │   ├── page.tsx
│   │   ├── posts/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── tags/[tag]/page.tsx
│   │   ├── categories/[category]/page.tsx
│   │   ├── archives/page.tsx
│   │   ├── about/page.tsx
│   │   └── projects/page.tsx
│   ├── api/
│   │   └── health/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── rss.xml/route.ts
│   ├── layout.tsx
│   └── globals.css
├── content/
│   ├── posts/
│   ├── pages/
│   ├── taxonomy/
│   └── .generated/
├── components/
├── lib/
│   ├── content/
│   ├── seo/
│   ├── cloudflare/
│   └── utils/
├── prompts/
├── scripts/
│   ├── ai/
│   ├── content/
│   └── ci/
├── reports/
│   ├── ai/
│   └── build/
├── public/
├── next.config.ts
├── open-next.config.ts
├── wrangler.jsonc
├── package.json
├── tsconfig.json
└── .github/workflows/
    ├── deploy.yml
    └── ai-content-check.yml
```

## 8. Rendering Strategy

Default to static generation for the homepage, post detail pages, archive pages, tag pages, category pages, and informational pages such as About and Projects. Allow dynamic rendering only for functionality such as health checks, optional search APIs, analytics ingestion, or low-latency interaction endpoints. Do not turn content-heavy blog routes into request-time rendering unless there is a concrete and measurable requirement.

页面渲染策略应当是：首页、文章详情页、归档页、标签页、分类页以及 About、Projects 这类信息页默认使用静态生成；动态渲染只用于健康检查、可选搜索 API、统计接收接口或少量低延迟交互端点。不要把内容型博客页面轻易改成请求时渲染，除非存在明确且可量化的需求。Cloudflare 官方 Next.js on Workers 路线支持静态与动态能力并存，因此这类“静态优先、动态补充”的页面策略是符合平台能力的。([developers.cloudflare.com](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/?utm_source=chatgpt.com))

## 9. Content Model

Store posts and pages as Markdown or MDX files with explicit frontmatter. Use frontmatter as the primary source for publication metadata. Generated AI suggestions may be persisted either into frontmatter after human approval or into sidecar metadata files under content/.generated.

文章和独立页面使用 Markdown 或 MDX 文件存储，并通过 frontmatter 提供明确的发布元数据。frontmatter 是发布信息的第一来源。AI 生成的建议内容只有在人工确认后才可以写回 frontmatter；否则建议保存在 content/.generated 目录中，作为旁路元数据供审核使用。

```yaml
---
title: "Build a Blog with Next.js on Cloudflare Workers"
description: "A practical guide to building a personal blog with Next.js, OpenNext, and Cloudflare Workers."
date: 2026-03-25
updated: 2026-03-25
tags:
  - Next.js
  - Cloudflare
  - OpenNext
category: Engineering
draft: false
featured: false
author: lilongbin
canonical: ""
summary: ""
seoTitle: ""
seoDescription: ""
cover: "/images/default-cover.png"
---
```

## 10. Next.js Application Rules

Use the App Router. Keep route modules small. Use server components by default for content pages and only introduce client components where interactivity is required. Centralize metadata generation in reusable helpers. Avoid runtime content fetching from external CMS systems for core blog pages. Load local content from the repository whenever possible.

应用层采用 App Router。每个路由模块尽量保持小而清晰。内容页默认使用 Server Components，只有在确实需要交互时才引入 Client Components。页面元数据生成要抽到可复用的 helper 中统一管理。核心博客页面不要再从外部 CMS 做运行时内容拉取，而应尽量直接从仓库中的本地内容源加载。

## 11. Cloudflare Deployment Rules

Use @opennextjs/cloudflare as the deployment adapter. Keep a dedicated open-next.config.ts file at the repository root. Keep a wrangler configuration file for bindings and deployment metadata. Prefer the adapter’s documented workflow and CLI over ad hoc custom deployment commands. Do not rely on deprecated or legacy Cloudflare Next.js deployment paths.

部署规则是：使用 @opennextjs/cloudflare 作为适配器；在仓库根目录放置 open-next.config.ts；使用 wrangler 配置文件管理绑定能力和 Worker 部署元数据；优先采用适配器文档推荐的工作流和 CLI，而不是拼接自定义部署命令；不要再依赖旧的或已经不推荐的 Cloudflare Next.js 部署路径。OpenNext 当前文档把 Cloudflare 适配明确成正式使用方式，并提供了 get started、CLI、bindings 和缓存扩展等文档。([opennext.js.org](https://opennext.js.org/cloudflare?utm_source=chatgpt.com))

## 12. Bindings Strategy

Treat Cloudflare bindings as explicit dependencies. Use bindings for optional capabilities such as incremental cache storage, asset or image storage, analytics ingestion, or lightweight interaction data. Access bindings through the Cloudflare adapter context utilities instead of inventing a custom abstraction too early.

Cloudflare bindings 要被视为“显式依赖”。它们适合承载一些可选能力，例如增量缓存存储、素材或图片存储、统计写入、轻量交互数据等。访问 bindings 时，优先采用 Cloudflare 适配器提供的上下文工具，而不是过早自造一层抽象。OpenNext 文档已经说明如何在应用中通过 getCloudflareContext 访问 bindings。([opennext.js.org](https://opennext.js.org/cloudflare/bindings?utm_source=chatgpt.com))

## 13. Caching Strategy

Use static generation as the first layer of caching. Add Cloudflare edge caching where appropriate for public assets and generated responses. If incremental cache persistence is needed, configure an adapter-supported cache backend such as R2 or KV according to the current OpenNext Cloudflare guidance. Keep cache decisions explicit and environment-specific.

缓存策略的第一层是静态生成本身。对于公共静态资源和适合缓存的响应，可以叠加 Cloudflare 边缘缓存。如果需要持久化增量缓存，就按照当前 OpenNext Cloudflare 文档选择适配器支持的缓存后端，例如 R2 或 KV。缓存策略必须显式配置，并且按环境区分，而不是隐式“自动魔法”。OpenNext 当前文档已经给出了缓存扩展示例，包括 R2 和历史版本中的 KV 方案。([opennext.js.org](https://opennext.js.org/cloudflare/get-started?utm_source=chatgpt.com))

## 14. AI Editorial Layer Goal

Implement AI assistance only in authoring and review workflows. The first production-ready AI scope should include proofreading, summary generation, SEO description suggestions, and formatting guidance. Do not invoke AI in the request path of the live blog. The production blog must remain fully functional even if the AI provider is unavailable.

AI 辅助层只服务于写作和审稿流程。第一阶段可投入生产的 AI 范围建议限定为：校对、摘要生成、SEO 描述建议和排版指导。线上博客的请求路径中绝不能调用 AI。即便 AI 服务不可用，正式博客也必须完整可用。

## 15. AI Tooling Implementation Contract

All AI tooling must be implemented as TypeScript CLIs executed locally or in CI. Every AI task must emit structured JSON first and optional Markdown summaries second. The code must validate model responses with a schema validator before writing reports. The system must support file, glob, and changed-files execution modes.

所有 AI 工具都要实现为可在本地或 CI 执行的 TypeScript CLI。每个 AI 任务必须先输出结构化 JSON，再按需输出 Markdown 汇总报告。模型返回结果在写入报告前必须经过 schema 校验器验证。执行模式要支持单文件、glob 批量和“仅变更文件”三种方式。

## 16. AI Workflow in Local Development

The local workflow is: write or edit content, run deterministic linting, run AI proofreading, run AI summary generation, run AI SEO suggestions, run AI formatting review, review the reports, optionally apply safe fixes, and then commit. Semantic changes must always remain reviewable and opt-in.

本地工作流如下：编写或修改内容后，先执行确定性规则校验，再执行 AI 校对、AI 摘要生成、AI SEO 建议和 AI 排版审查；接着阅读报告，按需应用低风险修复，最后再提交 Git。所有语义级修改必须保持可审阅和可选择，不允许默认自动覆盖原文。

## 17. AI Workflow in CI

In CI, run deterministic checks as hard gates and AI checks as soft report-generation steps. Upload the reports as artifacts. Optionally post a pull request summary. Do not auto-modify source files in CI. Allow AI failures to degrade to warnings unless explicitly configured otherwise.

在 CI 中，规则类检查作为硬性门禁，AI 检查作为软性报告步骤。AI 报告需要作为构建产物上传，并可选地在 PR 中生成摘要评论。CI 中不允许自动修改源文件。除非显式配置，否则 AI 步骤失败时应该降级为 warning，而不是阻断整个流程。

## 18. Chinese Typography System (Heti-inspired)

Adopt a Heti-inspired Chinese typography system for long-form reading pages. Heti is designed specifically to enhance Chinese content presentation and its documented capabilities include grid-aligned typography, full-tag styling improvements, preset styles for classical Chinese and poetry, multiple layout variants, dark mode adaptation, mixed Chinese-Latin spacing enhancement, full-width punctuation compression, compatibility with common CSS resets, and mobile support. Apply these ideas selectively to blog article reading surfaces instead of globally across the whole application shell.([github.com](https://github.com/sivan/heti))

为中文长文页面引入一套受 Heti 启发的中文排版系统。Heti 的定位就是“专为中文内容展示设计的排版样式增强”，其 README 当前明确列出的能力包括：贴合网格的排版、全标签样式美化、古文与诗词样式、多种版式、暗色模式适配、中西文混排美化、全角标点挤压、兼容常见 CSS Reset，以及移动端支持。对你的博客来说，正确做法不是全站一键套用，而是把这些能力有选择地应用到“文章阅读面”上。([github.com](https://github.com/sivan/heti))

## 18.1 Scope of Application

Apply Heti-style typography only to article content containers, long-form standalone pages, and selected reading-focused blocks. Do not apply automatic typography enhancement to navigation, cards, dashboards, forms, search inputs, tags UI, code blocks, or dense tabular layouts. The typography layer is for reading surfaces, not for the entire application chrome.

Heti 风格排版只应作用于文章正文容器、长文型独立页面，以及少数明确以阅读为核心的内容块。不要把自动排版增强直接作用到导航、卡片、仪表盘、表单、搜索输入框、标签 UI、代码块或高密度表格。排版系统服务的是“阅读面”，而不是整个应用壳层。

## 18.2 Integration Strategy

Use a three-layer strategy: source-layer normalization, AI-assisted editorial review, and presentation-layer typography enhancement. Source files should already respect spacing and punctuation rules as much as possible. AI should review content for readability and consistency. The Heti-inspired frontend layer should provide the final visual polish only.

建议采用三层接入策略：源文件规范层、AI 编辑审查层、展示排版增强层。源文件本身应尽量遵守空格和标点规则；AI 负责从可读性和一致性角度提出修正建议；前端 Heti 风格层只负责最后一层视觉润色。这样既能保证内容源干净，又能避免把所有问题都押给前端脚本去“临时修补”。

## 18.3 Source-Level Typography Rules

Enforce source-level rules through deterministic linting and optional AI review. At minimum, normalize spacing between Chinese and inline English words, spacing between Chinese and Arabic numerals when readability improves, consistent punctuation style inside Chinese prose, blank lines around headings, consistent list markers, and frontmatter completeness for content pages.

在源文件层，通过规则检查和可选 AI 审查落实排版规范。最少要覆盖这些规则：中文与内嵌英文单词之间的空格、中文与阿拉伯数字之间在可读性更好时补空格、中文正文中的标点风格统一、标题前后空行、列表标记统一，以及内容页 frontmatter 完整性检查。

## 18.4 AI Typography Review Rules

Use AI to review issues that are difficult to capture with static lint rules. Focus the AI review on overlong paragraphs, repeated sentence patterns, unclear transitions between sections, inconsistent list phrasing, heading hierarchy problems, mixed punctuation style, and readability problems in mixed Chinese-English technical writing. Keep the AI output advisory and reviewable.

AI 排版审查主要处理那些静态规则难以精确覆盖的问题。重点包括：段落过长、句式重复、章节之间过渡不清、列表表达不一致、标题层级问题、标点风格混杂，以及中英混合技术写作中的可读性问题。AI 输出必须保持“建议型”，并且始终可审阅。

## 18.5 Frontend Typography Enhancement Rules

Implement the frontend typography layer as an article-scoped enhancement. Use a dedicated reading container class such as `.heti` or an internal equivalent. Initialize any optional automatic spacing or punctuation compression logic only for the article container after the content has mounted on the client. Keep the enhancement opt-in and page-scoped.

前端排版增强层必须做成“文章范围内”的局部增强。可以使用 `.heti` 或你自己的等价类名作为阅读容器。若启用自动中西文间距或标点挤压逻辑，应只在文章内容完成挂载后，对文章容器做客户端初始化。整个增强机制必须是显式启用、页面范围受控的。

## 18.6 What to Borrow Directly from Heti

Borrow mixed Chinese-Latin typography enhancement, full-width punctuation compression, dark mode-aware reading styles, mobile-friendly reading spacing, and article-tag styling improvements. Treat grid rhythm as a design principle rather than a rigid constraint. Borrow specialized layouts such as poetry or classical Chinese blocks only as optional content components, not as the site-wide default.

建议直接吸收的 Heti 思想包括：中西文混排增强、全角标点挤压、暗色模式下的阅读样式、移动端阅读节奏优化，以及正文相关标签的整体样式美化。对于“贴合网格的排版”，更适合作为设计原则，而不是机械追求严格网格。至于诗词、古文、行间注等特殊版式，适合做成可选内容组件，而不是全站默认样式。Heti 官方当前也明确列出了这些特性。([github.com](https://github.com/sivan/heti))

## 18.7 Special Content Components

Create opt-in components for reading-focused Chinese layout patterns, such as PoetryBlock, ClassicalTextBlock, SideNoteBlock, or TwoColumnExcerpt. Use these components only for content that clearly benefits from specialized typography. Do not force technical posts into literary layouts.

可以为中文阅读型内容额外做一些“可选内容组件”，例如 PoetryBlock、ClassicalTextBlock、SideNoteBlock、TwoColumnExcerpt。这些组件只在内容本身确实受益于特殊排版时使用。技术博客正文不应该被强行套进文学化版式。

## 18.8 Dark Mode Typography Policy

Keep a separate dark-mode typography review pass for long-form reading pages. Verify contrast for body text, headings, links, blockquotes, captions, and code-adjacent explanatory text. Typography that looks refined in light mode can become muddy in dark mode if spacing, weight, and contrast are not tuned deliberately.

针对长文阅读页，建议单独做一次暗色模式排版审查。重点检查正文、标题、链接、引用块、图注以及代码块旁说明文字的对比度和节奏。很多在浅色模式下看起来不错的排版，切到暗色后如果不重新调整字重、间距和层次，就会显得发灰、发脏或难读。

## 18.9 Technical Blog Exceptions

Exclude code blocks, inline code spans, tables, terminal transcripts, navigation lists, badges, and interactive controls from automatic typography mutation. Chinese typography enhancement should never alter code semantics, table alignment, or UI affordances.

代码块、行内代码、表格、终端输出、导航列表、徽章和交互控件都应明确排除在自动排版变换之外。中文排版增强不能影响代码语义、表格对齐，也不能破坏 UI 的交互识别。

## 18.10 Suggested CSS and Runtime Contract

Create a dedicated article typography stylesheet or module and keep it independent from global reset rules. If Heti itself is used directly, import the stylesheet only where article reading surfaces are rendered and initialize its optional addon in a client-only boundary. If only Heti-inspired rules are adopted, preserve the same scope discipline.

建议单独建立文章排版样式表或模块，并与全局 reset 分开管理。如果你直接引入 Heti，那么应只在文章阅读页引入对应样式，并在客户端边界中初始化其可选 addon；如果你只是吸收 Heti 的思想自行实现，也要保持相同的“局部作用域”纪律。Heti README 当前给出的标准接法就是：引入 heti.css，给目标容器加 `class="heti"`，再按需调用 `new Heti('.heti').autoSpacing()`。([github.com](https://github.com/sivan/heti))

## 18.11 Chinese Typography Definition of Done

The typography system is considered complete when Chinese long-form pages render with consistent spacing, readable mixed Chinese-English technical prose, improved punctuation rhythm, stable dark-mode readability, mobile-friendly paragraph flow, and no regressions in code blocks, tables, or navigation surfaces.

当中文排版系统能够让长文页面在以下方面同时达标时，就可以视为落地完成：空格规范一致、中英混合技术内容更易读、标点节奏更自然、暗色模式仍然清晰、移动端段落流畅，同时代码块、表格和导航区域没有被误伤。

## 19. SEO System

Generate metadata from content and approved sidecar metadata. Implement sitemap, robots, RSS, canonical URLs, Open Graph tags, and structured data. Keep metadata generation deterministic. Do not ask the runtime to improvise SEO content on request.

SEO 系统应从内容源和已确认的旁路元数据中生成。必须实现 sitemap、robots、RSS、canonical URL、Open Graph 标签和结构化数据。元数据生成必须是确定性的，不能把 SEO 文案留给运行时临场“即兴发挥”。

## 20. Image Delivery and Protection System

Design image handling as a first-class subsystem, not as an afterthought. The image system must solve four problems together: source image quality, responsive delivery variants, article cover and thumbnail generation, and abuse-resistant public delivery. The implementation should favor Cloudflare-native capabilities wherever they reduce operational complexity.

图片系统要作为一等子系统来设计，而不是后期补丁。它必须同时解决四类问题：源图质量、响应式分发变体、文章封面与缩略图生成，以及对公开访问的抗滥用能力。实现上应优先利用 Cloudflare 原生能力，在保证效果的同时降低运维复杂度。

## 20.1 System Objective

The objective is to deliver article images with high visual quality, bounded file size, responsive variants, and predictable security controls. The application must never rely on raw full-resolution source images for public rendering unless explicitly required. Every public image path must be intentional, cache-friendly, and resistant to abuse.

图片系统的目标是：在保证视觉质量的同时控制文件体积，提供适配不同展示场景的变体，并具备可预测的安全控制。除非明确要求，否则应用不应直接对外渲染原始全分辨率图片。所有公开图片路径都应该是有意设计的、缓存友好的，并具备抗滥用能力。

## 20.2 Delivery Strategy

Store one high-quality source image and derive multiple controlled delivery variants from it. Do not expose arbitrary transformation parameters in public-facing URLs. Define a fixed set of variants for thumbnails, article covers, inline content images, and social sharing images. The frontend must request only these predefined variants.

推荐策略是：只存一份高质量源图，再从这份源图派生多个受控的分发变体。不要在面向公众的 URL 中暴露任意变换参数。应该预定义一组固定变体，分别服务于缩略图、文章封面、正文插图和社交分享图。前端只能请求这些预定义变体，不能自由拼接尺寸。

## 20.3 Recommended Cloudflare Role Split

Use Cloudflare Images or Cloudflare-compatible image transformation as the primary image delivery layer for article media. Use the Next.js application only as the consumer of approved variants, not as the place where arbitrary image sizing policy is invented. Keep image policy centralized.

建议把 Cloudflare Images 或 Cloudflare 兼容的图片变换能力作为文章图片的主分发层。Next.js 应用只负责消费已经批准的变体，而不是在应用层随意发明尺寸策略。图片策略应集中管理，而不是散落在组件代码里。

## 20.4 Source Image Policy

Accept source images at a controlled maximum dimension and store them as high-quality originals. Prefer a maximum long edge around 2400 pixels for general blog photography and article covers unless a stronger archival requirement exists. Keep metadata minimal when possible. Use lossless or visually high-quality uploads for the source, and perform delivery optimization at the edge.

源图策略建议是：控制上传尺寸上限，并保存为高质量原始版本。对于普通博客摄影图和文章封面，除非有更强的归档需求，否则建议把长边控制在 2400 像素左右。源图应尽量减少无用元数据。上传阶段可保留无损或高质量版本，真正的分发优化放在边缘层完成。

## 20.5 Variant Catalog

Define a small, stable variant catalog and make it part of the architecture contract. A recommended initial set is: `thumb-sm`, `thumb-md`, `cover-md`, `cover-lg`, and `og-cover`. Each variant should have a documented purpose, aspect ratio, and size envelope. Do not proliferate variants without a measurable need.

应该建立一份小而稳定的图片变体目录，并把它写进架构契约。第一版建议的变体集合是：`thumb-sm`、`thumb-md`、`cover-md`、`cover-lg`、`og-cover`。每个变体都要有明确用途、宽高比和尺寸边界。不要在没有明确收益的情况下无限增加变体数量。

## 20.6 Suggested Variant Definitions

Use the following initial variant definitions as a baseline: `thumb-sm` for compact list cards, `thumb-md` for featured lists and homepage cards, `cover-md` for article headers on standard displays, `cover-lg` for high-density article headers, and `og-cover` for social sharing images around 1200 by 630. Tune exact quality values during visual review, not by guesswork alone.

第一版变体建议如下：`thumb-sm` 用于紧凑列表卡片，`thumb-md` 用于首页或推荐区域，`cover-md` 用于普通文章头图，`cover-lg` 用于高密度显示设备上的高清头图，`og-cover` 用于大约 1200×630 的社交分享图。质量参数应在人工视觉审核中微调，而不是纯凭猜测拍脑袋设定。

## 20.7 Content Metadata Contract

Support an explicit `cover` field in frontmatter for author-controlled article covers. If `cover` is missing, extract the first content image as a fallback thumbnail candidate during build or content-processing time. Persist the resolved result into generated metadata so that list pages, article headers, and social metadata all use the same source of truth.

内容元数据层应支持 frontmatter 中的显式 `cover` 字段，让作者可以手动指定文章封面。如果 `cover` 缺失，则在构建期或内容处理阶段自动提取正文中的第一张图片，作为缩略图候选。最终解析出的结果应持久化到生成元数据中，使列表页、文章头图和社交元数据都共享同一个事实来源。

## 20.8 First-Image Thumbnail Policy

Use the following resolution order: explicit `cover` first, first body image second, and a site default image last. This makes article previews predictable while preserving author control. The extraction logic must run at build time or content indexing time, not on every request.

文章首图缩略图应遵循这个优先级：先用显式 `cover`，其次使用正文第一张图片，最后再回退到站点默认图片。这样既保留作者控制权，又能保证文章预览图稳定存在。提取逻辑应在构建期或内容索引阶段完成，而不是每个请求时再解析正文。

## 20.9 Next.js Rendering Contract for Images

Use Next.js image rendering for layout stability and responsive markup, but make it consume Cloudflare-governed image URLs or a Cloudflare-compatible loader strategy. Do not render original asset URLs directly in article lists or headers. Every UI surface should request a variant appropriate to its layout role.

在 Next.js 层，仍然应使用图片组件来保持布局稳定和响应式标记输出，但它必须消费由 Cloudflare 管理的图片 URL，或通过 Cloudflare 兼容的 loader 进行处理。不要在文章列表或头图区域直接渲染原始图片 URL。每个界面位置都应请求与自身布局角色相匹配的变体。

## 20.10 Example Variant Usage Policy

Use `thumb-sm` for post lists with compact cards, `thumb-md` for featured sections, `cover-md` or `cover-lg` for article hero images depending on viewport density, and `og-cover` for social metadata generation. Keep the mapping deterministic and documented in one helper module.

具体映射建议是：紧凑文章列表使用 `thumb-sm`，精选区使用 `thumb-md`，文章头图根据显示密度使用 `cover-md` 或 `cover-lg`，社交元数据统一使用 `og-cover`。这些映射关系要以确定性方式写在一个 helper 模块里，避免在不同页面各自发挥。

## 20.11 Cloudflare Image Optimization Boundary

Perform delivery optimization at the edge rather than creating many hand-managed files in the repository. Treat the repository as the place for content and approved references, not as a manual image-derivatives warehouse. When using Cloudflare-managed image services, keep the transformation policy centralized and audited.

图片分发优化应尽量在边缘层完成，而不是在仓库里手动维护大量导出后的图片文件。仓库更适合保存内容和经批准的引用，而不是变成“图片衍生文件仓库”。如果使用 Cloudflare 管理的图片服务，要把变换策略集中定义、可审计、可复用。

## 20.12 Public Abuse Model

Assume two main abuse classes: hotlinking by third-party sites and repeated abusive requests against image delivery endpoints or transformation paths. The architecture must protect against both. Hotlink protection alone is not enough when transformation endpoints or variant paths can be hammered programmatically.

应假定两类主要滥用场景：一是第三方站点直接热链你的图片，二是对图片分发端点或变换路径进行高频恶意请求。架构必须同时防住这两类问题。仅靠防盗链并不足以覆盖“程序化刷图”和“变体滥用”这类攻击。

## 20.13 Public Image Protection Policy

Enable hotlink protection for public image assets where appropriate. Apply WAF or rate-limiting rules to image delivery endpoints. If private or high-value images exist, protect them with signed URLs or another explicit authorization mechanism. Public readability and private access control must not be conflated.

对公开图片资源，应在适用场景下启用防盗链。对图片分发端点要叠加 WAF 或速率限制规则。如果存在私有或高价值图片，则应使用签名 URL 或其他显式授权机制加以保护。公开可读与私有受控访问是两类问题，不能混为一谈。

## 20.14 Arbitrary Transformation Prevention

Do not allow user-controlled arbitrary width, height, quality, or format parameters on public image URLs unless the request is authenticated and bounded. Prefer a fixed variant lookup table over a free-form querystring interface. This is both a cost-control and abuse-control measure.

禁止在公开图片 URL 中允许用户自由控制宽度、高度、质量或格式参数，除非该请求有明确认证并且受到严格约束。相比开放 querystring 变换，固定变体查表更适合博客场景。这不仅是性能优化，也是成本控制和反滥用策略。

## 20.15 Cloudflare WAF and Rate-Limit Placement

Place WAF and rate-limit controls in front of all image delivery routes that could be abused. Keep separate policies for public article media, transformation endpoints, and any signed or semi-private asset paths. Observe traffic before tightening thresholds, but document the intended protections from day one.

应把 WAF 和速率限制放在所有可能被滥用的图片分发路径前面。对公开文章图片、变换端点以及签名或半私有资源路径要分别制定策略。阈值可以在上线后根据流量观察再微调，但保护边界需要从第一天就写进设计。

## 20.16 Caching Policy for Images

Cache public variants aggressively at the edge, but keep source image replacement rules explicit. If a source image is replaced, either version the asset identifier or purge the affected variants deliberately. Avoid ambiguous overwrite behavior that leaves stale edge caches in place.

对于公开变体，应在边缘层积极缓存；但源图替换规则必须明确。如果源图被替换，要么使用版本化资源标识，要么显式清理相关变体缓存。不要采用那种“看似覆盖同名文件、实际边缘缓存仍旧陈旧”的模糊方式。

## 20.17 Suggested Metadata Fields

Extend the content metadata model with optional image-related fields such as `cover`, `coverAlt`, `thumbnail`, `thumbnailAlt`, `imageCredit`, and `ogImage`. Keep generated fields separate from author-supplied fields when practical.

建议把内容元数据模型补充一些图片相关字段，例如 `cover`、`coverAlt`、`thumbnail`、`thumbnailAlt`、`imageCredit` 和 `ogImage`。在条件允许的情况下，作者手写字段与构建生成字段应尽量区分开来，避免相互污染。

## 20.18 Accessibility Policy

Every article cover and inline image should have meaningful alternative text when it contributes content meaning. Decorative images may use empty alt text intentionally. Thumbnail fallback extraction must not invent misleading alt text; if author-supplied alt text is absent, leave it clearly empty or request review.

如果文章封面或正文图片承载了内容含义，就应提供有意义的替代文本；如果图片只是装饰，可以有意使用空的 alt 文本。自动提取缩略图时，不应捏造误导性的 alt 文本；若作者未提供 alt，应保持明确为空，或进入人工审查。

## 20.19 Example Image Policy Statements

Adopt the following baseline policy statements in implementation: all article images must be delivered through predefined Cloudflare-managed variants; the application must never expose raw originals on content listing surfaces; and image protection controls must fail closed for unauthorized private assets while public readability enhancements must fail open.

在实施时，建议把这三条作为图片基线政策：所有文章图片都必须通过预定义的 Cloudflare 管理变体分发；内容列表类界面不得暴露原始图片；对于未授权私有资源，保护控制必须 fail-closed，而对于公开图片的展示增强可以 fail-open。

## 20.20 Immediate Implementation Artifacts

The first implementation artifacts for this subsystem should be: an image policy document, a variant definition helper, content metadata extraction logic for first-image fallback, a Next.js image wrapper component, a Cloudflare binding and deployment configuration update, and WAF or rate-limit deployment notes.

这一子系统接下来最适合直接产出的实施文件包括：图片策略文档、变体定义 helper、正文第一张图回退提取逻辑、Next.js 图片包装组件、Cloudflare 绑定与部署配置更新，以及 WAF / 速率限制部署说明。

## 21. Analytics System (Umami + Google Analytics 4)

Use a dual-analytics model with clear role separation. Use Umami as the privacy-first content analytics system for pageviews and reading-oriented interactions. Use Google Analytics 4 as the acquisition, attribution, and conversion analytics system. Both tools may record pageviews, but event ownership must be intentionally split to avoid duplicate interpretation and noisy dashboards.

采用“双分析系统 + 明确职责分工”的模式。Umami 作为隐私优先的内容分析系统，负责页面浏览和阅读导向的站内交互；Google Analytics 4 作为流量获取、归因和转化分析系统。两者都可以记录 pageview，但事件归属必须有意识地拆分，避免报表解释混乱和重复统计噪声。

## 21.1 System Objective

The objective is to obtain high-quality content insights without sacrificing acquisition visibility. The analytics stack should answer two different classes of questions: what readers do inside the blog, and where they came from before arriving. Do not expect one tool to be the authoritative answer for both classes equally well.

分析系统的目标是：既能看清楚内容表现，又不丢失流量来源与转化可见性。整套方案要分别回答两类问题：读者在站内做了什么，以及他们在进入站点之前来自哪里。不要期待单一工具能同样擅长回答这两类问题。

## 21.2 Responsibility Split

Assign content and reading behavior analysis to Umami. Assign traffic source, campaign attribution, referral analysis, and conversion-oriented events to Google Analytics 4. Keep this split documented so future implementation does not accidentally duplicate all custom events into both systems without intent.

职责划分建议是：把内容与阅读行为分析交给 Umami，把流量来源、活动归因、引荐分析和转化导向事件交给 Google Analytics 4。这个分工需要写进架构文档，避免后续实现时不加区分地把所有自定义事件同时打到两个系统里。

## 21.3 Default Measurement Scope

Allow both systems to collect pageviews for the full site. Use Umami to analyze article popularity, reading entry points, outbound link interactions, search opening, code-copy behavior, and other editorial interaction signals. Use GA4 to analyze source/medium, campaign performance, organic search traffic, subscription funnels, downloads, and conversion-like interactions.

建议让两套系统都记录全站 pageview。Umami 重点分析文章热度、阅读入口页、外链点击、搜索打开、代码复制等偏内容与阅读的信号；GA4 则重点分析 source/medium、活动效果、自然搜索流量、订阅漏斗、下载行为以及更偏转化的交互。

## 21.4 Event Ownership Policy

Create one unified event naming layer in application code, but explicitly map each event to Umami, GA4, or both. Do not assume that every tracked behavior must be sent to both systems. Keep the event registry versioned and reviewed.

建议在应用代码里只维护一套统一的事件命名层，但要明确每个事件是发给 Umami、GA4，还是同时发给两者。不要默认所有行为都必须同时上报给两个系统。事件注册表应参与版本管理，并定期审查。

## 21.5 Recommended Event Split

Use Umami for `toc_click`, `copy_code`, `open_search`, `click_cover`, `read_related_post`, and `outbound_link`. Use GA4 for `subscribe`, `generate_lead`, `download_file`, `sign_up`, and other conversion-oriented events. If a behavior has both editorial and commercial significance, sending it to both systems is acceptable, but the reason must be explicit.

推荐的事件分工如下：Umami 侧可采集 `toc_click`、`copy_code`、`open_search`、`click_cover`、`read_related_post`、`outbound_link`；GA4 侧可采集 `subscribe`、`generate_lead`、`download_file`、`sign_up` 以及其他偏转化的事件。如果某个行为同时具备内容价值和商业价值，可以同时发给两边，但必须有明确理由。

## 21.6 Next.js Integration Strategy

Integrate analytics at the root layout level for full-site availability, but keep custom event dispatch inside a dedicated analytics utility layer. Third-party scripts must be initialized once at the application root. Route-aware custom event tracking should happen through reusable helpers, not ad hoc inline calls spread throughout components.

在 Next.js 中，分析脚本应放在根布局层，以保证全站可用；但自定义事件分发应封装在独立的 analytics 工具层里。第三方脚本必须只在应用根部初始化一次。任何与路由相关或交互相关的自定义事件，都应通过复用 helper 触发，而不是散落在各个组件里写内联上报代码。

## 21.7 Umami Integration Contract

Load the Umami tracking script once at the application root with the configured website ID. Keep the script domain configurable through environment variables. Prefer an explicit script integration so that the analytics dependency remains visible and easy to audit.

Umami 的集成方式是：在应用根部只加载一次其 tracking script，并通过 website ID 进行配置。脚本域名应通过环境变量配置。推荐使用显式脚本接入，这样分析依赖始终是可见、可审计的。

## 21.8 GA4 Integration Contract

Integrate Google Analytics 4 using a root-level integration path appropriate for the Next.js App Router. Keep the GA measurement ID in environment variables. Do not initialize Google Analytics through multiple competing mechanisms at the same time.

GA4 的集成应采用适合 Next.js App Router 的根级接入方式。GA 的 Measurement ID 通过环境变量注入。不要同时用多种不同机制初始化 GA，否则很容易造成重复统计。

## 21.9 Cloudflare Zaraz Positioning

Treat Cloudflare Zaraz as an optional future optimization for GA4, not as the default first implementation. Zaraz can reduce direct third-party script exposure and may help with consent and edge-managed collection, but it should not be introduced in the first version unless its operational trade-offs are accepted deliberately.

Cloudflare Zaraz 更适合作为 GA4 的可选后续优化，而不是第一版默认方案。它可以减少前端直接暴露第三方脚本，也有利于 consent 和边缘托管；但如果你还没准备好接受它带来的兼容性和调试差异，就不建议一开始就上。

## 21.10 Duplicate Initialization Prevention

Never enable two GA4 loading paths at once. If GA4 is loaded directly in the application, do not also enable a parallel Zaraz-managed GA4 integration. Likewise, do not load the Umami script in multiple layouts or duplicate client boundaries.

必须避免重复初始化。若 GA4 已经在应用内直连加载，就不要再并行启用 Zaraz 管理的 GA4；同理，Umami 脚本也不能在多个 layout 或多个客户端边界里重复加载。

## 21.11 Recommended Environment Variables

Define separate environment variables for Umami and GA4. Keep them public only when necessary for client-side initialization, and keep any optional future server-side or edge-side secrets separate.

建议为 Umami 和 GA4 分别定义环境变量。凡是客户端初始化必须暴露的参数才使用公开环境变量；若未来有服务端或边缘端专用密钥，则应另行隔离管理。

```bash
NEXT_PUBLIC_UMAMI_SCRIPT_URL=
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_ENABLE_UMAMI=true
NEXT_PUBLIC_ENABLE_GA=true
```

## 21.12 Root Layout Integration Example

Use a root layout integration structure similar to the following. Keep feature flags around both analytics systems so they can be disabled independently.

根布局可以采用下面这种接入结构。建议给两个分析系统都加特性开关，方便独立启停。

```tsx
// app/layout.tsx
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const enableUmami = process.env.NEXT_PUBLIC_ENABLE_UMAMI === 'true';
  const enableGA = process.env.NEXT_PUBLIC_ENABLE_GA === 'true';

  return (
    <html lang="zh-CN">
      <head>
        {enableUmami ? (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body>{children}</body>
      {enableGA && process.env.NEXT_PUBLIC_GA_ID ? (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      ) : null}
    </html>
  );
}
```

## 21.13 Shared Tracking Utility

Create a single analytics dispatch utility that knows where each event should go. The utility must remain small, explicit, and easy to audit. It should avoid hidden side effects and support event parameters cleanly.

建议创建一个统一的 analytics 分发工具，让它清楚知道每个事件应该发往哪里。这个工具要保持小而明确、便于审计，避免隐藏副作用，并且要能清晰传递事件参数。

```ts
// lib/analytics/track.ts
export type AnalyticsTarget = 'umami' | 'ga4' | 'both';

export type AnalyticsEventName =
  | 'toc_click'
  | 'copy_code'
  | 'open_search'
  | 'click_cover'
  | 'outbound_link'
  | 'subscribe'
  | 'generate_lead'
  | 'download_file';

const EVENT_TARGETS: Record<AnalyticsEventName, AnalyticsTarget> = {
  toc_click: 'umami',
  copy_code: 'umami',
  open_search: 'umami',
  click_cover: 'umami',
  outbound_link: 'both',
  subscribe: 'ga4',
  generate_lead: 'ga4',
  download_file: 'ga4',
};

export function trackEvent(name: AnalyticsEventName, params?: Record<string, unknown>) {
  const target = EVENT_TARGETS[name];

  if (typeof window !== 'undefined' && (target === 'umami' || target === 'both')) {
    // @ts-expect-error runtime global
    window.umami?.track?.(name, params);
  }

  if (typeof window !== 'undefined' && (target === 'ga4' || target === 'both')) {
    // @ts-expect-error runtime global
    window.gtag?.('event', name, params || {});
  }
}
```

## 21.14 SPA Navigation Considerations

Because the application uses client-side navigation in the App Router, pageview handling and route transitions must be verified carefully in both analytics systems. Do not assume correct SPA tracking without validating route changes in local testing and production-like previews.

由于应用使用 App Router 下的客户端路由跳转，因此两套分析系统的 pageview 与路由切换统计都需要认真验证。不要想当然地认为 SPA 跳转一定会被正确统计，必须在本地和接近生产的预览环境中做实际验证。

## 21.15 Consent and Regional Policy

If regional privacy requirements become relevant, add a consent layer before expanding GA4 usage or before migrating GA4 into Zaraz-managed collection. Umami may remain the privacy-friendly default baseline, while GA4 should be made region-aware if legal or product requirements demand it.

如果未来需要考虑区域性隐私要求，那么在扩大 GA4 使用范围，或迁移到 Zaraz 托管之前，应先补上 consent 层。Umami 可以继续作为更偏隐私友好的基础分析系统，而 GA4 则应在法律或产品要求下做区域化处理。

## 21.16 Dashboard Policy

Keep Umami dashboards focused on content performance and reading behavior. Keep GA4 dashboards focused on acquisition, attribution, and conversion questions. Do not compare every metric one-to-one across the two systems; instead, interpret each system according to its role.

仪表盘层面，Umami 应聚焦内容表现和阅读行为，GA4 应聚焦流量获取、归因和转化问题。不要试图把两个系统的每一个指标都逐项对齐比较，而应根据它们各自承担的职责来解释数据。

## 21.17 Failure Policy

Analytics must fail open. If one analytics provider is unavailable, page rendering and user interaction must remain unaffected. The tracking layer should degrade silently or log warnings in development without breaking the site.

分析系统必须采用 fail-open 策略。即使某个分析服务不可用，页面渲染和用户交互也不能受到影响。跟踪层应静默降级，或仅在开发环境中输出 warning，而不能影响站点本身。

## 21.18 Immediate Implementation Artifacts

The first implementation artifacts for this subsystem should be: an analytics policy document, a root-layout integration update, `lib/analytics/track.ts`, an event registry file, optional route-change verification notes, and a dashboard ownership checklist.

这一子系统下一步最适合直接产出的实施文件包括：分析策略文档、根布局集成更新、`lib/analytics/track.ts`、事件注册表文件、可选的路由切换验证说明，以及仪表盘职责清单。

## 21.19 Next.js Integration Code Skeleton

Use the following file set as the first executable analytics baseline for the Next.js App Router application. Keep analytics initialization, event ownership, and dispatch logic in separate files so that an AI coding agent can extend the system without entangling concerns.

下面这组文件可以作为 Next.js App Router 下分析系统的第一版可执行骨架。建议把脚本初始化、事件归属和事件分发逻辑拆分到不同文件里，这样 AI 编程代理在扩展系统时不会把职责缠在一起。

```text
app/
└── layout.tsx
lib/
└── analytics/
    ├── event-registry.ts
    ├── track.ts
    ├── providers.ts
    └── route-change-debug.ts
config/
└── analytics/
    └── analytics-policy.md
```

## 21.20 Event Registry Example

Create a central event registry that records the target analytics system for each event, plus optional metadata such as category or business intent. Keep this registry deterministic and version-controlled.

建议建立一个中央事件注册表，为每个事件声明它应该发往哪个分析系统，并可附带 category 或业务意图等辅助信息。这份注册表要保持确定性，并纳入版本管理。

```ts
// lib/analytics/event-registry.ts
export type AnalyticsTarget = 'umami' | 'ga4' | 'both';

export type AnalyticsEventName =
  | 'toc_click'
  | 'copy_code'
  | 'open_search'
  | 'click_cover'
  | 'read_related_post'
  | 'outbound_link'
  | 'subscribe'
  | 'generate_lead'
  | 'download_file'
  | 'sign_up';

export interface AnalyticsEventDefinition {
  target: AnalyticsTarget;
  category: 'content' | 'engagement' | 'conversion' | 'acquisition';
  description: string;
}

export const ANALYTICS_EVENT_REGISTRY: Record<AnalyticsEventName, AnalyticsEventDefinition> = {
  toc_click: {
    target: 'umami',
    category: 'content',
    description: 'Reader clicked a table-of-contents item.',
  },
  copy_code: {
    target: 'umami',
    category: 'engagement',
    description: 'Reader copied code from an article.',
  },
  open_search: {
    target: 'umami',
    category: 'engagement',
    description: 'Reader opened site search.',
  },
  click_cover: {
    target: 'umami',
    category: 'content',
    description: 'Reader clicked an article cover image.',
  },
  read_related_post: {
    target: 'umami',
    category: 'content',
    description: 'Reader opened a related article.',
  },
  outbound_link: {
    target: 'both',
    category: 'engagement',
    description: 'Reader clicked an outbound link.',
  },
  subscribe: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader completed a subscription action.',
  },
  generate_lead: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader completed a lead-generation action.',
  },
  download_file: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader downloaded a file.',
  },
  sign_up: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader completed a sign-up action.',
  },
};
```

## 21.21 Provider Detection Helper

Create a small provider helper to avoid scattering runtime-global checks throughout the application. The helper should expose clear functions for checking provider availability.

建议再做一个小型 provider helper，用来避免把运行时全局对象检测散落在应用各处。这个 helper 只做一件事：清晰地判断不同分析 provider 当前是否可用。

```ts
// lib/analytics/providers.ts
export function hasUmami(): boolean {
  return typeof window !== 'undefined' && typeof (window as Window & { umami?: { track?: Function } }).umami?.track === 'function';
}

export function hasGA4(): boolean {
  return typeof window !== 'undefined' && typeof (window as Window & { gtag?: Function }).gtag === 'function';
}
```

## 21.22 Tracking Utility Example

Create a single tracking utility that dispatches events according to the event registry. The utility must fail open and must ignore unknown or misconfigured events gracefully.

建议实现一个统一的 tracking 工具，根据事件注册表来分发事件。这个工具必须采用 fail-open 策略，并且在遇到未知事件或配置错误时要优雅降级，不能影响页面行为。

```ts
// lib/analytics/track.ts
import { ANALYTICS_EVENT_REGISTRY, AnalyticsEventName } from './event-registry';
import { hasGA4, hasUmami } from './providers';

export function trackEvent(name: AnalyticsEventName, params?: Record<string, unknown>) {
  const definition = ANALYTICS_EVENT_REGISTRY[name];
  if (!definition) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[analytics] Unknown event: ${name}`);
    }
    return;
  }

  const { target } = definition;

  try {
    if ((target === 'umami' || target === 'both') && hasUmami()) {
      (window as Window & { umami?: { track?: Function } }).umami?.track?.(name, params);
    }

    if ((target === 'ga4' || target === 'both') && hasGA4()) {
      (window as Window & { gtag?: Function }).gtag?.('event', name, params || {});
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[analytics] Event dispatch failed.', error);
    }
  }
}
```

## 21.23 Root Layout Integration Skeleton

Initialize Umami and GA4 at the root layout. Keep them behind feature flags and environment variables so the application can disable each system independently across environments.

在根布局中初始化 Umami 和 GA4。两者都应受特性开关和环境变量控制，以便应用可以在不同环境中独立启停每个系统。

```tsx
// app/layout.tsx
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const enableUmami = process.env.NEXT_PUBLIC_ENABLE_UMAMI === 'true';
  const enableGA = process.env.NEXT_PUBLIC_ENABLE_GA === 'true';
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="zh-CN">
      <head>
        {enableUmami && umamiScriptUrl && umamiWebsiteId ? (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body>{children}</body>
      {enableGA && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
```

## 21.24 Optional Route-Change Verification Helper

Add a small route-change debug helper in development builds to verify that client-side navigation produces the expected pageview behavior. This helper should not ship user-facing UI and should remain easy to remove after validation.

建议在开发环境中增加一个很小的路由变化调试 helper，用来验证客户端跳转是否触发了预期的 pageview 行为。这个 helper 不应产生用户可见 UI，也应该很容易在验证完成后移除。

```ts
// lib/analytics/route-change-debug.ts
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useRouteChangeDebug() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const qs = searchParams?.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      console.info('[analytics] Route changed:', url);
    }
  }, [pathname, searchParams]);
}
```

## 21.25 Example Usage in UI Components

Use the tracking utility inside interaction components instead of calling provider globals directly. This keeps event ownership centralized and prevents analytics drift.

在 UI 组件中使用统一的 tracking 工具，不要直接调用 provider 的全局对象。这样能确保事件归属仍然由中央注册表控制，避免分析实现逐渐漂移。

```tsx
'use client';

import { trackEvent } from '@/lib/analytics/track';

export function CopyCodeButton({ onCopy }: { onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        onCopy();
        trackEvent('copy_code', { location: 'article_code_block' });
      }}
    >
      Copy
    </button>
  );
}
```

## 21.26 Dashboard Ownership Checklist

Maintain a small checklist that states which dashboards answer which questions. Umami should answer content-performance and reading-behavior questions. GA4 should answer traffic-source, attribution, and conversion questions. This checklist is part of the architecture because it prevents organizational misuse of data.

建议维护一份小型仪表盘职责清单，明确“哪个问题应该看哪个系统”。Umami 回答内容表现和阅读行为问题，GA4 回答来源、归因和转化问题。这份清单也属于架构的一部分，因为它可以防止后续对数据的误用。

## 21.27 Suggested Analytics Policy Snippet

Use the following policy snippet as the baseline implementation rule: pageviews may be collected by both Umami and GA4, but custom event ownership must be intentionally split. Reading-related events belong to Umami by default, while acquisition and conversion events belong to GA4 by default.

下面这条可以直接作为分析系统的实施基线规则：pageview 可以由 Umami 和 GA4 同时采集，但自定义事件的归属必须有意拆分。默认情况下，阅读相关事件归 Umami，流量获取与转化相关事件归 GA4。

## 22. Search Strategy

Start with static or build-time search index generation. Load the search index on demand in the client when the user opens search. Do not introduce a dedicated search backend in the first implementation unless the content volume or query requirements justify it.

搜索建议从静态或构建期生成索引开始。前端只在用户真正打开搜索时按需加载索引。第一版不建议引入独立搜索后端，除非内容量或查询复杂度已经证明有必要。

## 23. Comments and Analytics

Use external services or light edge-friendly integrations for comments and analytics. Delay-load comments. Keep analytics scripts minimal. Prefer operational simplicity over bespoke in-house systems.

评论和统计优先使用外部服务或轻量的边缘友好集成。评论区应延迟加载，统计脚本尽量轻量。对于个人博客，优先考虑运维简单，而不是自建复杂系统。

## 24. Observability and Operations

Collect build logs, AI report artifacts, runtime logs, deployment results, and basic uptime signals. Add alarms for failed deployments, missing artifacts, and repeated runtime errors. Keep the operational baseline small but explicit.

可观测与运维至少要覆盖：构建日志、AI 报告工件、运行日志、部署结果和基础可用性信号。对部署失败、报告缺失和持续出现的运行时错误设置告警。个人博客的运维基线不需要很重，但必须是显式的。

## 25. Required Files for the Executable Baseline

The first executable baseline must include next.config.ts, open-next.config.ts, wrangler.jsonc, package.json, tsconfig.json, the AI scripts under scripts/ai, prompt files under prompts/, and GitHub Actions workflows for deploy and AI content checks.

第一版可执行基线至少要包含这些文件：next.config.ts、open-next.config.ts、wrangler.jsonc、package.json、tsconfig.json、scripts/ai 下的 AI 脚本、prompts/ 下的提示词文件，以及用于部署和 AI 内容检查的 GitHub Actions 工作流。

## 26. Example open-next.config.ts Requirement

Create an open-next.config.ts file using the current Cloudflare adapter configuration API. Keep the configuration small at first. Add cache persistence only when a concrete need exists. The implementation should stay close to the official examples so that future upgrades remain manageable.

open-next.config.ts 必须使用当前 Cloudflare 适配器提供的配置 API 来实现。第一版配置要尽量小，只在有明确需求时才接入持久化缓存。实现风格要尽量贴近官方示例，以便未来升级时维护成本更低。OpenNext 当前 get-started 文档展示了通过 defineCloudflareConfig 创建配置，并按需添加 R2 或 KV 增量缓存。([opennext.js.org](https://opennext.js.org/cloudflare/get-started?utm_source=chatgpt.com))

## 27. Example wrangler.jsonc Requirement

Create a Wrangler configuration file that declares the Worker name, compatibility date, and only the bindings actually needed by the application. Do not predeclare speculative infrastructure. Keep development and production values separated.

wrangler 配置文件需要声明 Worker 名称、compatibility date，以及应用真正需要的 bindings。不要把猜想中的未来基础设施先全部声明进去。开发环境和生产环境的值必须分开管理。

## 28. Example Package Scripts

Define scripts for next dev, next build, OpenNext Cloudflare build and deploy, deterministic content linting, AI content checks, and local report review. Keep each script independently runnable.

package.json 中要提供这些脚本：Next.js 本地开发、Next.js 构建、OpenNext Cloudflare 构建与部署、规则类内容校验、AI 内容检查，以及本地报告查看。每个脚本都要能独立运行，便于本地调试和 CI 组合。

## 29. GitHub Actions Deployment Contract

The deploy workflow must install dependencies, run deterministic checks, build the Next.js app, run the OpenNext Cloudflare build step, and deploy using the documented Cloudflare-compatible workflow. It must fail fast on deterministic errors and must not silently skip deployment-critical steps.

部署工作流必须完成这些步骤：安装依赖、执行规则类校验、构建 Next.js 应用、执行 OpenNext Cloudflare 构建步骤，并通过符合官方路线的方式完成部署。遇到确定性错误时必须快速失败，不能默默跳过关键部署步骤。

## 30. AI Coding Agent Constraints

When this design is handed to an AI coding agent, require explicit typing, small modules, schema-validated model output, environment-driven configuration, no hidden global state, and dry-run support for any auto-fix command. The agent should prioritize readability and operational safety over clever abstractions.

当这份设计交给 AI 编程代理时，要明确要求：类型显式、模块小、模型输出有 schema 校验、配置走环境变量、禁止隐藏全局状态、任何自动修复命令都要支持 dry-run。实现时应优先考虑可读性和运维安全，而不是炫技式抽象。

## 31. Definition of Done

The architecture is considered implemented when a developer can author Markdown or MDX content in Git, statically generate blog pages through Next.js, deploy the site to Cloudflare Workers using OpenNext, run AI editorial checks locally and in CI, review machine-readable and human-readable reports, and operate the site without any runtime dependence on AI services.

当开发者能够在 Git 中编写 Markdown 或 MDX 内容，使用 Next.js 静态生成博客页面，通过 OpenNext 将站点部署到 Cloudflare Workers，在本地和 CI 中运行 AI 编辑检查，并同时获得机器可读与人工可读的报告，而且整站在运行时对 AI 服务没有任何依赖时，就可以认为这套架构已经完成落地。

## 32. Recommended Next Deliverables

The next code-oriented deliverables should be generated in this order: package.json, tsconfig.json, next.config.ts, open-next.config.ts, wrangler.jsonc, content loading utilities, SEO helpers, scripts/ai shared types and client utilities, prompt files, deploy.yml, and ai-content-check.yml.

接下来最适合继续生成的代码化交付物顺序建议为：package.json、tsconfig.json、next.config.ts、open-next.config.ts、wrangler.jsonc、内容加载工具、SEO helper、scripts/ai 的共享类型与客户端工具、提示词文件，以及 deploy.yml 和 ai-content-check.yml。

## 33. Chinese Typography Policy File

Create a dedicated typography policy file that serves as the shared source of truth for lint rules, AI review prompts, and frontend implementation boundaries. Store it in a stable path such as `docs/policies/chinese-typography.md` or `config/typography/chinese-typography.md`. The policy must be versioned and referenced by both deterministic scripts and AI tooling.

要单独建立一份中文排版规范文件，作为 lint 规则、AI 审查提示词和前端实现边界的共同规范源。建议存放在稳定路径，例如 `docs/policies/chinese-typography.md` 或 `config/typography/chinese-typography.md`。这份规范必须参与版本管理，并同时被确定性脚本和 AI 工具引用。

## 33.1 Policy File Objective

The typography policy file must define what the content source should look like, what the AI reviewer is allowed to suggest, what the frontend enhancement layer may adjust visually, and what must never be auto-mutated. This separation reduces ambiguity and prevents frontend polish tools from becoming silent content editors.

中文排版规范文件必须明确四件事：源文件应该长什么样、AI 审查允许提出哪些建议、前端增强层可以做哪些纯视觉调整、哪些内容绝不能被自动改写。把这四层边界写清楚，能有效避免前端润色工具演变成“静默内容编辑器”。

## 33.2 Recommended Policy File Content

Use the following structure for the policy file: scope, hard rules, soft rules, visual-only rules, excluded regions, terminology whitelist guidance, examples, and exception handling. Keep the language imperative and testable.

建议把规范文件写成以下结构：适用范围、硬规则、软规则、纯视觉规则、排除区域、术语白名单指导、示例和例外处理。行文风格应尽量使用命令式、可测试的表达。

## 33.3 Example Chinese Typography Policy

Use this as the initial baseline policy.

下面这份可以直接作为第一版中文排版规范基线。

```md
# Chinese Typography Policy

## Scope
This policy applies to long-form Chinese blog posts, article-like standalone pages, summaries, excerpts, and long captions.

本规范适用于中文长文博客文章、文章型独立页面、摘要、摘录和较长图注。

## Hard Rules
1. Insert one space between Chinese characters and adjacent Latin words in prose.
2. Insert one space between Chinese characters and adjacent Arabic numerals when readability improves.
3. Use full-width Chinese punctuation in Chinese prose unless the token is part of code, a URL, or a formal identifier.
4. Keep one blank line before and after headings.
5. Keep list marker style consistent within the same list.
6. Do not skip heading levels without a deliberate reason.
7. Keep fenced code blocks with explicit language identifiers whenever possible.
8. Ensure every post frontmatter contains title, description, date, tags, and draft.

1. 中文正文中，中文字符与相邻英文单词之间补一个空格。
2. 中文正文中，中文字符与相邻阿拉伯数字之间在可读性更佳时补一个空格。
3. 中文正文默认使用全角中文标点，除非该符号属于代码、URL 或正式标识符的一部分。
4. 标题前后各保留一个空行。
5. 同一列表内的项目符号风格保持一致。
6. 标题层级不得无故跳级。
7. 代码块尽量使用带语言标识的 fenced code block。
8. 每篇文章的 frontmatter 至少包含 title、description、date、tags、draft。

## Soft Rules
1. Split paragraphs longer than 180 Chinese characters or longer than 6 visual lines when practical.
2. Prefer shorter sentences when multiple clauses make the sentence hard to parse.
3. Add a brief explanation when a technical term first appears and may be unfamiliar to the intended audience.
4. Keep heading phrasing parallel within the same section level.
5. Avoid mixed punctuation styles in the same paragraph.

1. 当段落超过 180 个中文字符或超过 6 行视觉长度时，优先考虑拆段。
2. 当一个句子包含过多分句导致理解困难时，优先拆句。
3. 技术术语首次出现且可能不为目标读者熟悉时，建议补充简要解释。
4. 同一层级的标题表达尽量保持平行一致。
5. 同一段落内避免混用不同标点风格。

## Visual-Only Rules
1. Full-width punctuation compression may be applied in rendered article content.
2. Mixed Chinese-Latin spacing may be visually enhanced in the article container.
3. Reading rhythm adjustments may be applied in dark mode and on mobile devices.

1. 在渲染后的文章正文中，可对全角标点进行视觉挤压。
2. 在文章容器中，可对中西文混排进行视觉增强。
3. 在暗色模式和移动端，可对阅读节奏进行视觉层面的调整。

## Excluded Regions
Do not auto-mutate code blocks, inline code, tables, URLs, terminal transcripts, navigation items, badges, forms, or UI control labels.

不得自动变换以下区域：代码块、行内代码、表格、URL、终端输出、导航项、徽章、表单和 UI 控件标签。

## Terminology Whitelist Guidance
Maintain a terminology whitelist for product names, framework names, package names, CLI commands, mixed-language technical phrases, and domain-specific acronyms.

维护一份术语白名单，覆盖产品名、框架名、包名、CLI 命令、中英混合技术短语和领域缩写。

## Exceptions
When readability rules conflict with source fidelity for code, quotations, or historical documents, preserve source fidelity and annotate the exception if necessary.

当可读性规则与代码、引文或历史文献的原貌保持发生冲突时，应优先保留原貌，并在必要时标注例外原因。
```

## 33.4 Policy Consumption Contract

Deterministic scripts should consume the policy as explicit rule definitions. AI prompts should summarize the policy and include only the subset relevant to the task. Frontend code should consume only the scope and excluded-region parts, not the semantic editing guidance.

确定性脚本应把这份规范当成显式规则定义来消费。AI 提示词应概括这份规范，并且只注入与当前任务相关的子集。前端代码只需要消费“适用范围”和“排除区域”这类边界信息，不应直接使用语义编辑指导部分。

## 34. Next.js Heti Integration Plan

Integrate Heti or Heti-inspired behavior only at the article rendering layer inside the Next.js application. Keep the application shell, navigation, and non-reading UI outside the typography enhancement boundary. The implementation must be compatible with the App Router and must avoid server-side execution of client-only enhancement code.

Heti 或 Heti-inspired 行为只集成到 Next.js 应用的文章渲染层。应用壳层、导航以及非阅读型 UI 必须排除在排版增强边界之外。实现上需要兼容 App Router，并避免在服务端执行只能在客户端运行的增强代码。

## 34.1 Integration Objective

The objective is to improve long-form Chinese reading quality without changing content semantics, breaking code presentation, or introducing layout instability. The enhancement should be local, reversible, testable, and easy for an AI coding agent to implement.

集成目标是：在不改变内容语义、不破坏代码呈现、不引入布局抖动的前提下，提升中文长文阅读体验。整个增强方案必须是局部的、可回退的、可测试的，也要方便 AI 编程代理直接实现。

## 34.2 Recommended File Layout

Use a dedicated typography integration area inside the Next.js app. Keep styles, client initialization, and article container wiring separate.

建议在 Next.js 项目中为中文排版单独划出集成区域，把样式、客户端初始化和文章容器接线分开管理。

```text
app/
├── (site)/posts/[slug]/page.tsx
├── layout.tsx
└── globals.css
components/
├── article/
│   ├── ArticleContent.tsx
│   ├── ArticleTypography.tsx
│   └── ArticleProse.module.css
lib/
├── typography/
│   ├── heti-client.ts
│   ├── excluded-selectors.ts
│   └── policy.ts
public/
└── ...
styles/
└── heti-overrides.css
```

## 34.3 Server and Client Boundary

Render article HTML or MDX on the server, but initialize typography enhancement only in a client component that runs after mount. The server component should own content loading and semantic structure. The client component should only attach enhancement behavior to the article container.

文章 HTML 或 MDX 的渲染仍然应由服务端完成，但排版增强初始化必须放到一个客户端组件里，并在挂载后执行。服务端组件负责内容加载和语义结构，客户端组件只负责把增强行为挂到文章容器上。

## 34.4 Recommended Component Split

Use three layers: a server-rendered page component, a presentational ArticleContent component, and a small client-only ArticleTypography enhancer. Keep the enhancer free of content-loading concerns.

建议拆成三层：服务端渲染的页面组件、负责结构与样式的 ArticleContent 组件，以及一个很小的客户端专用 ArticleTypography 增强组件。增强组件不要承担内容加载职责。

```tsx
// app/(site)/posts/[slug]/page.tsx
import { getPostBySlug } from '@/lib/content/posts';
import { ArticleContent } from '@/components/article/ArticleContent';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return <ArticleContent post={post} />;
}
```

```tsx
// components/article/ArticleContent.tsx
import { ArticleTypography } from './ArticleTypography';
import styles from './ArticleProse.module.css';

export function ArticleContent({ post }: { post: { html: string; title: string } }) {
  return (
    <article className={styles.article}>
      <header>
        <h1>{post.title}</h1>
      </header>
      <ArticleTypography />
      <section
        className={`heti ${styles.prose}`}
        data-article-content
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
```

```tsx
// components/article/ArticleTypography.tsx
'use client';

import { useEffect } from 'react';
import { initHetiForArticle } from '@/lib/typography/heti-client';

export function ArticleTypography() {
  useEffect(() => {
    initHetiForArticle('[data-article-content]');
  }, []);

  return null;
}
```

## 34.5 Heti Client Contract

The Heti client helper must be idempotent, selector-scoped, and safe when the library is unavailable. It must never throw uncaught runtime errors that break article rendering. If enhancement cannot be initialized, the article must still remain fully readable.

Heti 客户端辅助函数必须满足三个条件：幂等、基于选择器局部作用、在库不可用时也安全。它绝不能因为运行时错误导致文章渲染失败。即便增强初始化失败，文章本身也必须保持完整可读。

```ts
// lib/typography/heti-client.ts
export async function initHetiForArticle(selector: string) {
  if (typeof window === 'undefined') return;

  const container = document.querySelector(selector);
  if (!container) return;
  if ((container as HTMLElement).dataset.hetiApplied === 'true') return;

  try {
    const mod = await import('heti');
    const HetiCtor = mod.default ?? mod.Heti ?? mod;
    const heti = new HetiCtor(selector);
    if (typeof heti.autoSpacing === 'function') {
      heti.autoSpacing();
    }
    (container as HTMLElement).dataset.hetiApplied = 'true';
  } catch (error) {
    console.warn('Heti enhancement failed to initialize.', error);
  }
}
```

## 34.6 CSS Scope Contract

Keep typography styles scoped to the article container. Avoid applying Heti-related selectors globally to body, main, or generic prose classes shared by non-article pages. Override styles in a dedicated file when needed.

排版样式必须严格限制在文章容器作用域内。不要把 Heti 相关选择器直接全局施加到 body、main 或其他会被非文章页面共享的 prose 类上。需要覆盖样式时，统一放在独立文件中处理。

```css
/* styles/heti-overrides.css */
.heti[data-article-content],
[data-article-content].heti {
  line-height: 1.9;
  word-break: break-word;
}

[data-article-content].heti :where(pre, code, table, kbd, samp) {
  letter-spacing: normal;
  word-spacing: normal;
}

[data-article-content].heti blockquote {
  opacity: 0.92;
}

.dark [data-article-content].heti {
  color: rgba(255, 255, 255, 0.88);
}
```

## 34.7 Excluded Region Selectors

Maintain a small list of excluded selectors and keep it centralized. Use it in tests, documentation, and any future custom enhancement logic.

把排除区域选择器维护成一份小清单，并集中管理。未来无论是测试、文档，还是你自己扩展的增强逻辑，都应复用这份清单。

```ts
// lib/typography/excluded-selectors.ts
export const TYPOGRAPHY_EXCLUDED_SELECTORS = [
  'pre',
  'code',
  'table',
  'kbd',
  'samp',
  '.not-prose',
  'nav',
  'button',
  'input',
  'textarea',
  '[data-no-typography="true"]',
];
```

## 34.8 Recommended MDX Content Boundary

When using MDX, wrap only the rendered prose section with the typography class. Leave interactive MDX components outside the enhanced prose container whenever practical. If an interactive component must appear inline, mark it with an escape hatch such as `data-no-typography="true"`.

如果你使用 MDX，建议只把真正的 prose 正文区包在排版类名里。交互式 MDX 组件尽量放在增强容器外部；如果必须内联放进正文，也要给它一个逃生标记，例如 `data-no-typography="true"`。

## 34.9 Hydration and Performance Guidance

Initialize typography enhancement after the article content has mounted. Avoid repeated initialization on every re-render. Do not block first paint for typography polish. Visual enhancement is secondary to content availability.

排版增强应在文章内容完成挂载后再初始化。避免在每次重新渲染时重复初始化，也不要为了排版润色而阻塞首屏渲染。视觉增强的重要性永远低于内容可见性。

## 34.10 Dark Mode Integration

Review dark mode explicitly for long-form pages. Tune paragraph color, heading contrast, link visibility, blockquote rhythm, and code-adjacent explanatory text. Keep dark mode overrides local to article reading surfaces.

暗色模式需要为长文页面单独审查。重点调节段落文字颜色、标题对比度、链接可见性、引用块节奏，以及代码块旁的说明文字。暗色模式覆盖样式要局限在文章阅读面，不要全站泛化。

## 34.11 Testing Strategy

Test the typography integration with content snapshots, visual regression checks for long-form pages, and manual inspection on mobile and dark mode. Include cases with mixed Chinese-English technical prose, code-heavy articles, tables, poetry-like excerpts, and blockquotes.

测试策略建议包括：内容快照、长文页面的视觉回归检查，以及移动端和暗色模式下的人工巡检。测试样例至少要覆盖：中英混排技术文、代码密集文章、带表格文章、类似诗词的摘录块，以及引用块。

## 34.12 Failure and Rollback Policy

Typography enhancement must fail open. If the enhancement library breaks, article pages should still render with baseline prose styles. Keep the enhancement easy to disable through a single feature flag or a single component removal.

排版增强必须采用 fail-open 策略。即使增强库出现问题，文章页也应退回到基础 prose 样式，而不是渲染失败。整个增强系统还要能通过一个 feature flag 或删除一个组件的方式快速回退。

## 34.13 Suggested Feature Flag

Add a feature flag such as `NEXT_PUBLIC_ENABLE_HETI=true` and gate the client initializer behind it. This gives a safe rollout path and makes troubleshooting simpler in production-like environments.

建议加一个特性开关，例如 `NEXT_PUBLIC_ENABLE_HETI=true`，并让客户端初始化逻辑受它控制。这样更适合灰度启用，也方便在接近生产的环境里排查问题。

## 34.14 Example Feature-Flagged Initializer

Use a feature-flagged initializer that exits early when the feature is disabled.

可以使用下面这种带特性开关的初始化方式，未启用时直接提前返回。

```ts
// lib/typography/heti-client.ts
export async function initHetiForArticle(selector: string) {
  if (process.env.NEXT_PUBLIC_ENABLE_HETI !== 'true') return;
  if (typeof window === 'undefined') return;

  const container = document.querySelector(selector);
  if (!container) return;
  if ((container as HTMLElement).dataset.hetiApplied === 'true') return;

  try {
    const mod = await import('heti');
    const HetiCtor = mod.default ?? mod.Heti ?? mod;
    const heti = new HetiCtor(selector);
    if (typeof heti.autoSpacing === 'function') {
      heti.autoSpacing();
    }
    (container as HTMLElement).dataset.hetiApplied = 'true';
  } catch (error) {
    console.warn('Heti enhancement failed to initialize.', error);
  }
}
```

## 34.15 Integration Definition of Done

The integration is complete when article pages render correctly without the enhancement, improve in readability when the enhancement is enabled, preserve code and table fidelity, remain stable in dark mode and mobile layouts, and can be rolled back without touching the content source.

当文章页在未启用增强时也能正常显示、启用增强后可读性确实提升、代码和表格保持原样、暗色模式和移动端布局仍然稳定，并且可以在不改动内容源的前提下快速回退时，就可以认为集成完成。

## 34.16 Immediate Next Code Deliverables

The next concrete code files for this typography layer should be: `config/typography/chinese-typography.md`, `lib/typography/heti-client.ts`, `lib/typography/excluded-selectors.ts`, `components/article/ArticleTypography.tsx`, `styles/heti-overrides.css`, and the article-page wiring changes.

这层中文排版系统接下来最适合直接生成的代码文件包括：`config/typography/chinese-typography.md`、`lib/typography/heti-client.ts`、`lib/typography/excluded-selectors.ts`、`components/article/ArticleTypography.tsx`、`styles/heti-overrides.css`，以及文章页接线相关改动。

