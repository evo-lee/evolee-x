# Phase 0 — 脚手架与配置基线 / Scaffolding & Config Baseline

> **完成日期 / Completed**: 2026-03-26
> **验收结果 / Acceptance**: `next build` ✅ · `tsc --noEmit` ✅ · 依赖安装 ✅

---

## 概述 / Overview

Phase 0 是整个项目最关键的一步。它不写任何业务逻辑，只做一件事：**让项目可以编译、可以本地运行、可以被部署到 Cloudflare Workers**。

Phase 0 is the most foundational step in the entire project. It writes no business logic — its only goal is to make the project **compile, run locally, and be deployable to Cloudflare Workers**.

你可以把 Phase 0 想象成在建一栋楼之前先打地基、架脚手架。没有这一层，后续所有阶段都无从开始。

Think of Phase 0 as laying the foundation and erecting scaffolding before constructing a building. Without it, no subsequent phase can begin.

---

## 创建的文件 / Files Created

```
evolee-x/
├── package.json              ← 依赖声明 + npm 脚本
├── tsconfig.json             ← TypeScript 编译配置
├── next.config.ts            ← Next.js 应用配置
├── open-next.config.ts       ← Cloudflare 适配器配置
├── wrangler.jsonc            ← Cloudflare Worker 部署配置
├── eslint.config.js          ← 代码质量规则
├── .prettierrc               ← 代码格式风格
├── postcss.config.mjs        ← Tailwind v4 集成
├── .gitignore                ← 排除构建产物
├── .env.example              �� 环境变量模板
├── app/
│   ├── layout.tsx            ← 根布局（占位）
│   ├── page.tsx              ← 首页（占位）
│   └── globals.css           ← 全局样式（占位）
├── scripts/ci/
│   └── lint-content.ts       ← 内容 lint 脚本（占位）
└── [所有目录骨架 + .gitkeep]
```

---

## 逐文件讲解 / File-by-File Explanation

### `package.json` — 项目依赖与脚本

**这是什么？**
`package.json` 是 Node.js 项目的"身份证"，记录了项目名称、所有第三方依赖包及版本、以及可运行的 npm 脚本。

**What is it?**
`package.json` is the Node.js project manifest. It records the project name, all third-party dependencies with their versions, and runnable npm scripts.

**关键决策 / Key decisions:**

1. **`dependencies` vs `devDependencies` 的区分**

   ```json
   "dependencies": { "next": "^15.2.3", "react": "^19.0.0", ... }
   "devDependencies": { "@opennextjs/cloudflare": "^1.17.3", "typescript": "^5.7.3", ... }
   ```

   - `dependencies`：生产环境运行时需要的包（React、Next.js、内容处理工具）
   - `devDependencies`：只在开发/构建阶段需要的包（TypeScript 编译器、部署工具、lint 工具）
   - **为什么区分？** 减少生产环境的包体积。对于 Cloudflare Workers，构建产物越小，冷启动越快。

   - `dependencies`: packages needed at runtime in production
   - `devDependencies`: packages only needed during development or build
   - **Why separate?** Smaller production bundles = faster Cloudflare Worker cold starts.

2. **`@anthropic-ai/sdk` 放在 `devDependencies`**

   AI 工具只在本地和 CI 中运行，永远不会出现在 Cloudflare Worker 的运行时。因此放在 devDependencies，避免它被打包进 Worker。

   The AI SDK only runs locally and in CI — never in the Cloudflare Worker runtime. Placing it in devDependencies prevents it from being bundled into the Worker.

3. **npm 脚本设计 / npm script design**

   ```json
   "dev":        "next dev --turbopack"     ← 本地开发，Turbopack 加速热更新
   "build":      "next build"               ← 标准 Next.js 构建
   "cf:build":   "opennextjs-cloudflare build"   ← Cloudflare Worker 构建
   "cf:preview": "opennextjs-cloudflare preview" ← 本地 Worker 模拟
   "cf:deploy":  "opennextjs-cloudflare deploy"  ← 部署到 Cloudflare
   ```

   每个脚本都可以独立运行。你不必每次都走完整部署流程——开发时用 `dev`，验证 Worker 行为时用 `cf:preview`，上线时才用 `cf:deploy`。

   Each script is independently runnable. You don't have to run the full deploy cycle every time — use `dev` for development, `cf:preview` to validate Worker behavior locally, and `cf:deploy` only when releasing.

---

### `tsconfig.json` — TypeScript 配置

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./*"] }
  }
}
```

**`strict: true` 是什么意思？**

这一个选项等价于同时开启了 7 个独立的严格检查：

This single option enables 7 strict checks simultaneously:

| 检查项 / Check | 作用 / Purpose |
|---|---|
| `strictNullChecks` | 不允许把 `null`/`undefined` 赋给非空类型 |
| `strictFunctionTypes` | 函数参数类型必须精确匹配 |
| `strictBindCallApply` | `bind`/`call`/`apply` 的参数类型安全 |
| `strictPropertyInitialization` | 类属性必须在构造函数中初始化 |
| `noImplicitAny` | 禁止隐式推断为 `any` |
| `noImplicitThis` | `this` 必须有明确类型 |
| `alwaysStrict` | 输出 `"use strict"` |

**为什么必须开严格模式？**

博客项目要长期维护，严格模式能在编译期捕获大量运行时错误（空指针、类型不匹配等）。在 AI 编程代理的帮助下开发时，strict 模式尤其重���——它强制代理写出类型精确的代码。

**Why is strict mode mandatory?**

A blog is a long-lived project. Strict mode catches many runtime errors (null pointer, type mismatch) at compile time. When developing with AI coding agents, strict mode is especially important — it forces agents to produce type-precise code.

**`"paths": { "@/*": ["./*"] }` — 路径别名**

这让你在任何文件中都可以用 `@/lib/content/posts` 代替 `../../lib/content/posts`。无论文件在多深的目录里，导入路径都保持统一清晰。

This allows you to use `@/lib/content/posts` instead of `../../lib/content/posts` from any file. Import paths remain consistent and readable regardless of directory depth.

---

### `next.config.ts` — Next.js 配置

```typescript
const nextConfig: NextConfig = {
  images: { unoptimized: true },
};
```

**为什么 `unoptimized: true`？**

Next.js 的内置图片优化服务（`/_next/image`）需要一个 Node.js 服务器来动态处理图片。Cloudflare Workers 不是 Node.js 服务器，无法运行这个服务。

我们在 **Phase 4** 会把图片切换到 Cloudflare Images 管理，届时改为使用自定义 loader。目前先用 `unoptimized: true` 让构建通过。

**Why `unoptimized: true`?**

Next.js's built-in image optimization service (`/_next/image`) requires a Node.js server for dynamic image processing. Cloudflare Workers are not Node.js servers and cannot run this service.

In **Phase 4** we'll switch to Cloudflare Images with a custom loader. For now, `unoptimized: true` makes the build succeed.

**为什么用 `.ts` 而不是 `.js`？**

Next.js 15 原生支持 TypeScript 配置文件。使用 `.ts` ���以获得类型提示和配置验证，避免写错字段名。

**Why `.ts` instead of `.js`?**

Next.js 15 natively supports TypeScript config files. Using `.ts` provides type hints and validation, preventing typos in config keys.

---

### `open-next.config.ts` — OpenNext Cloudflare 适配器配置

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
export default defineCloudflareConfig({});
```

**OpenNext 是什么？**

Next.js 官方的构建输出格式是为 Vercel 平台优化的。要在其他平台（如 Cloudflare Workers）运行，需要一个"适配器"把 Next.js 的构建产物转换成目标平台能理解的格式。OpenNext 就是做这个转换工作的工具。

**What is OpenNext?**

Next.js's official build output format is optimized for the Vercel platform. To run on other platforms (like Cloudflare Workers), an "adapter" is needed to transform the Next.js build output into a format the target platform understands. OpenNext does this transformation.

**架构流程 / Architecture flow:**

```
next build → .next/ (Vercel 格式)
          ↓
opennextjs-cloudflare build → .open-next/ (Worker 格式)
          ↓
wrangler deploy → Cloudflare Workers 边缘节点
```

**为什么现在配置为空 `{}`？**

空配置使用所有默认值，这足够应付大多数博客的静态内容场景。当需要增量缓存（ISR）时，才会在这里添加 R2 或 KV 缓存后端配置。

**Why is it empty `{}` now?**

Empty config uses all defaults, which is sufficient for most static blog content. Cache backends (R2/KV) would only be added here when incremental cache persistence is actually needed.

---

### `wrangler.jsonc` — Cloudflare Worker 部署配置

```jsonc
{
  "name": "evolee-x",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

**逐字段解析 / Field-by-field breakdown:**

| 字段 / Field | 作用 / Purpose |
|---|---|
| `name` | Worker 在 Cloudflare Dashboard 中的名称，也是部署 URL 的一部分（`evolee-x.workers.dev`）|
| `main` | Worker 的入口文件。OpenNext 构建后会在 `.open-next/worker.js` 生成这个文件 |
| `compatibility_date` | Cloudflare 冻结行为的基准日期。设置后，Cloudflare 不会让未来的平台变更影响你的 Worker |
| `compatibility_flags: ["nodejs_compat"]` | **关键**：开启 Node.js 兼容模式。Next.js 和许多 npm 包需要 Node.js API（Buffer、crypto、stream 等），这个 flag 在 Workers 环境中提供这些 API |
| `assets` | 静态文件（HTML、JS、CSS、图片）的目录绑定。Worker 通过 `env.ASSETS.fetch()` 访问这些文件 |

**`nodejs_compat` 为什么必须开启？**

Cloudflare Workers 原生运行环境不是 Node.js，而是一个遵循 Web Standards 的 JavaScript 运行时。但 Next.js 和大多数 npm 包的代码里会用到 Node.js 特有的 API（如 `Buffer`、`crypto`）。`nodejs_compat` flag 让 Workers 提供这些 API 的 Polyfill，使代码能正常运行。

**Why must `nodejs_compat` be enabled?**

Cloudflare Workers' native runtime is not Node.js — it's a JavaScript runtime following Web Standards. But Next.js and most npm packages use Node.js-specific APIs (e.g., `Buffer`, `crypto`). The `nodejs_compat` flag makes Workers provide polyfills for these APIs so code runs correctly.

---

### `.gitignore` — Git 排除规则

```
.next/          ← Next.js 构建产物
.open-next/     ← Cloudflare 构建产物
content/.generated/*   ← AI 生成的旁路元数据（不提交）
reports/ai/*    ← AI 报告（不提交）
.env.local      ← 包含密钥的本地环境变量（绝不提交！）
```

**最重要的规则：绝不提交密钥**

`.env.local` 文件中存储 API 密钥、数据库凭据等敏感信息。通过 `.gitignore` 排除这个文件是防止密钥泄漏的第一道防线。我们用 `.env.example` 作为模板（不含真实值），这个文件是提交到 Git 的。

**Most important rule: Never commit secrets**

`.env.local` stores API keys and other sensitive information. Excluding this file from Git is the first line of defense against credential leaks. We use `.env.example` as a template (without real values) — this file IS committed to Git.

**注意 `.gitkeep` 文件的用途**

Git 不跟踪空目录。我们在 `content/.generated/`、`reports/ai/`、`reports/build/` 这些目录里放了 `.gitkeep` 文件，让 Git 知道这些目录需要存在，同时把目录里的实际生成内容排除在 Git 之外。

**Purpose of `.gitkeep` files**

Git doesn't track empty directories. We place `.gitkeep` files in `content/.generated/`, `reports/ai/`, and `reports/build/` so Git knows these directories should exist, while the actual generated contents within are excluded from Git.

---

### `eslint.config.js` + `.prettierrc` — 代码质量与格式

**ESLint vs Prettier 的分工**

- **ESLint**：检查代码逻辑问题（未使用的变量、潜在的 React Hooks 错误、TypeScript 类型违规等）
- **Prettier**：统一代码格式（缩进、引号、分号、换行等），不关心逻辑

**ESLint vs Prettier responsibilities**

- **ESLint**: checks code logic issues (unused variables, React Hooks violations, TypeScript violations)
- **Prettier**: enforces consistent formatting (indentation, quotes, semicolons, line breaks), not logic

**Prettier 关键配置 / Key Prettier settings:**

```json
{
  "singleQuote": true,    ← 用单引号（TypeScript 社区惯例）
  "trailingComma": "es5", ← 对象/数组末尾的逗号（让 Git diff 更干净）
  "printWidth": 100       ← 每行最多 100 字符（现代宽屏友好）
}
```

---

### `postcss.config.mjs` — Tailwind CSS v4

**Tailwind v4 和 v3 有什么不同？**

Tailwind v4 是一次重大改版：

| 特性 | v3 | v4 |
|---|---|---|
| 配置文件 | `tailwind.config.js` | CSS `@theme {}` 块 |
| 安装 | `tailwindcss` + CLI | `tailwindcss` + `@tailwindcss/postcss` |
| 性能 | 快 | 快 10 倍（用 Rust 重写） |
| 前缀 | 手动配置 | 开箱即用 |

**How does Tailwind v4 differ from v3?**

Tailwind v4 is a major redesign:
- Configuration moves from `tailwind.config.js` to CSS `@theme {}` blocks
- The PostCSS plugin (`@tailwindcss/postcss`) handles everything
- Performance is ~10× faster (rewritten in Rust)

在 `app/globals.css` 里，`@import 'tailwindcss'` 这一行就会引入所有 Tailwind 工具类。主题定制写在同一个 CSS 文件的 `@theme {}` 块里。

In `app/globals.css`, `@import 'tailwindcss'` imports all Tailwind utility classes. Theme customization is written in `@theme {}` blocks in the same CSS file.

---

### `app/layout.tsx` — 根布局（占位版）

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

**为什么 Phase 0 就需要这个文件？**

Next.js App Router 强制要求每个应用有且只有一个根布局文件（`app/layout.tsx`），否则 `next build` 会直接报错。这个占位版在 Phase 2 会被完整版替换。

**Why is this file needed in Phase 0?**

Next.js App Router requires exactly one root layout file (`app/layout.tsx`) — `next build` fails without it. This placeholder will be replaced with the full version in Phase 2.

**`lang="zh-CN"` 有什么用？**

1. 告诉浏览器页面的主要语言，影响默认字体选择
2. 屏���阅读器会用正确的语言规则朗读内容
3. 搜索引擎会更好地理解页面的目标受众

**What does `lang="zh-CN"` do?**

1. Tells the browser the primary language, affecting default font selection
2. Screen readers use the correct language rules for content narration
3. Search engines better understand the target audience

---

## 目录结构的设计逻辑 / Directory Structure Design Rationale

创建的目录结构反映了架构文档中的五层模型：

The created directory structure reflects the five-layer model from the architecture document:

```
content/          ← 第一层：内容层（Markdown/MDX 文件）
app/              ← 第二层：应用层（Next.js 路由）
components/       ← 第二层：应用层（React 组件）
lib/              ← 第二层：应用层（工具函数）
scripts/ai/       ← 第三层：AI 编辑层（只在本地/CI 运行）
.github/          ← 第四层：部署层（CI/CD 工作流）
```

每个子目录的职责是单���的，AI 编程代理和人类维护者都能快速判断某个文件应该放在哪里。

Each subdirectory has a single, clear responsibility. Both AI coding agents and human maintainers can quickly determine where a given file belongs.

---

## 遇到的问题与解决方法 / Issues Encountered & Solutions

### 问题 1：`@opennextjs/cloudflare` 要求 `wrangler@^4`

**现象 / Symptom**: `npm install` 报 peer dependency 冲突

**原因 / Cause**: `@opennextjs/cloudflare@1.17.x` 升级到了要求 wrangler v4，而初始 `package.json` 中写的是 `wrangler@^3`。

**解决 / Fix**: 将 `wrangler` 版本从 `^3.105.0` 更新为 `^4.0.0`。

**学习点 / Learning**: 使用带版本范围（`^`）的依赖时，应当先检查目标包的 peer dependency 要求，避免安装时冲突。

### 问题 2：`heti@^0.9.12` 不存在

**现象 / Symptom**: `npm install` 报找不到匹配版本

**原因 / Cause**: heti 包的最新版本是 `0.9.6`，`^0.9.12` 超过了实际发布的版本号。

**解决 / Fix**: 查询真实版本 `npm show heti versions`，改为 `^0.9.6`。

**学习点 / Learning**: 在规划阶段写 `package.json` 时，版本号是估算的。实际安装前用 `npm show <package> versions` 确认真实版本。

---

## 验收验证步骤 / Acceptance Verification Steps

完成 Phase 0 后，按以下顺序验证：

```bash
# 1. 安装依赖（如果还没运行）
npm install

# 2. TypeScript 严格检查 — 应无任何输出
npm run type-check

# 3. Next.js 构建 — 应出现绿色路由表
npm run build

# 4. 本地开发服务器 — 应在 localhost:3000 看到占位页面
npm run dev

# 5. （可选）Cloudflare Worker 本地预览
npm run cf:build && npm run cf:preview
```

---

## 关键知识总结 / Key Takeaways

1. **配置文件是架构决策的文字化** — 每一行配置都反映了某个架构决策，不是随意填写的。

2. **TypeScript strict 模式是基线，不是选项** — 整个项目从第一天起就必须无 TypeScript 错误，否则随着代码增多，修复成本会指数增长。

3. **`next build` 和 `cf:build` 是两个步骤** — `next build` 生成 `.next/` 目录（Vercel 格式），`opennextjs-cloudflare build` 再把它转换成 `.open-next/` 目录（Worker 格式）。理解这两步的关系对调试部署问题很重要。

4. **永远不要提交 `.env.local`** — API 密钥一旦提交到 Git，即使删除也可能被历史记录恢复。`.env.example` 是公开模板，`.env.local` 是私密实例。

5. **目录结构是团队协作协议** — 良好的目录结构减少了"这个文件该放哪里"的心智负担，让 AI 代理和人类维护者都能高效工作。

---

**1. Configuration files are the written form of architecture decisions.** Every line of config reflects a deliberate decision.

**2. TypeScript strict mode is a baseline, not an option.** Start with zero TypeScript errors on day one. Fixing errors gets exponentially more expensive as the codebase grows.

**3. `next build` and `cf:build` are two separate steps.** `next build` produces `.next/` (Vercel format); `opennextjs-cloudflare build` transforms it into `.open-next/` (Worker format). Understanding this relationship is critical for debugging deployment issues.

**4. Never commit `.env.local`.** Once API keys are committed to Git, they can be recovered from history even after deletion. `.env.example` is the public template; `.env.local` is the private instance.

**5. Directory structure is a collaboration contract.** A well-designed structure reduces the cognitive overhead of "where does this file go?" for both AI agents and human maintainers.

---

## 下一阶段预览 / Next Phase Preview

**Phase 1 — 内容层与数据模型** 将实现：
- 从 `content/posts/*.mdx` 读取文章的完整数据管道
- 用 Zod 验证 frontmatter 的 schema（字段类型安全）
- 用 remark/rehype 将 Markdown 转换为 HTML（代码高亮用 Shiki）
- 封面图优先级解析逻辑（`cover` > 正文首图 > 站点默认）

**Phase 1 — Content Layer & Data Model** will implement:
- A complete data pipeline reading articles from `content/posts/*.mdx`
- Zod-validated frontmatter schema (type-safe fields)
- Markdown-to-HTML conversion via remark/rehype (code highlighting with Shiki)
- Cover image resolution logic (`cover` > first body image > site default)
