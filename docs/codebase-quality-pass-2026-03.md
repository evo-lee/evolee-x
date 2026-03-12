# 代码库工程化优化（2026-03）

## 目标
围绕目录组织、模块职责、React 运行时模式和工具链信号质量做一轮收敛，让仓库更适合作为长期维护的开源项目。

## 背景
项目功能已经比较完整，但随着 AI 对话、内容索引、About 页面等能力持续叠加，部分模块开始出现职责混合、脚本与运行时边界不清、lint 噪音过高的问题。

## 实现
- 将 `src/lib/content/posts.ts` 中的 Markdown 渲染与 HTML 转换逻辑拆分到 `src/lib/content/post-markdown.ts`，让 `posts.ts` 回到“内容装载与索引”的职责。
- 将 `src/lib/content/article-chat-guide-utils.js` 升级为 `src/lib/content/article-chat-guide-utils.ts`，明确 guide 输入/输出类型。
- 为 Node 脚本增加 `scripts/utils/article-chat-guide-utils.mjs`，保持脚本侧与应用侧职责分离，同时兼容现有 Node 运行方式。
- 将 `src/components/ai-chat-box.tsx` 拆分为编排层与展示层：`chat-avatar.tsx`、`chat-message.tsx`、`chat-panel.tsx` 承接头像、消息渲染与面板 UI，主文件仅保留对话 session、入口态和上下文切换逻辑。
- 继续收敛 chat UI：将 `chat-panel.tsx` 中的浏览器行为、错误映射和文章入口 UI 拆到 `use-chat-panel-controller.ts`、`chat-error.ts`、`article-chat-launcher.tsx`、`chat-starter-cards.tsx`，并新增 `use-media-query.ts`、`use-entrance-transition.ts` 复用通用交互逻辑。
- 将 `site-footer.tsx` 中的 analytics 数据结构、国家映射、数字/时间格式化和客户端缓存拉取逻辑拆到 `src/lib/analytics/summary.ts` 与 `src/hooks/use-analytics-summary.ts`，让 footer 组件回到展示职责。
- 将 `site-header.tsx` 与 `article-toc.tsx` 中的交互状态继续拆分到 `use-article-toc.ts`、`article-toc-section-list.tsx`、`site-header-about-link.tsx`、`site-header-mobile-menu.tsx`，并补充 `use-click-outside.ts`、`use-scroll-threshold.ts` 作为通用浏览器交互 hook。
- 将 `src/app/api/chat/route.ts` 中的当前文章上下文解析、搜索上下文复用、关键词检索编排提取到 `src/lib/ai/chat-route.ts`，让 route handler 聚焦请求校验、流式响应和通知发送。
- 将 `src/components/search-command.tsx` 中的数据装载、缓存、Pagefind/API 回退逻辑下沉到 `src/hooks/use-search-command.ts`，让组件回到命令面板 UI 与导航交互职责。
- 统一抽出 `src/lib/browser/scroll-progress.ts`，复用 AI chat 移动入口与文章页自动拉起逻辑中的滚动进度判断，避免重复的浏览器实现细节散落在组件里。
- 将 About 页的模型切换状态收敛到 `src/hooks/use-about-model-selection.ts` 与 `src/components/about/about-model-client.tsx`，避免客户端首屏直接读取 `window.location.search` 造成 hydration 风险，同时让 `model-switcher.tsx` 只保留展示职责。
- 修正 `site-header-about-link.tsx` 中首屏直接读取 `localStorage` 的实现，改为挂载后再决定是否播放 About 提示动效，避免 header 导航出现同类 hydration 风险。
- 将主题切换的 storage key、首屏注入脚本、DOM 同步和事件分发抽到 `src/lib/theme.ts` 与 `src/hooks/use-theme-mode.ts`，让 `layout.tsx`、`theme-toggle.tsx`、`theme-color-meta.tsx` 复用同一套主题实现。
- 新增 `src/lib/favicon.ts`，统一 About 模型切换与 Markdown 外链 favicon 的代理地址生成逻辑，减少重复实现。
- 将文章页客户端副作用继续下沉：新增 `use-article-content-enhancer.ts` 承接 TweetCard hydrate、正文图片加载标记、图片 zoom、外链兜底和 Umami 埋点，让 `content-enhancer.tsx` 回到单一挂载入口。
- 将评论加载链路拆到 `use-artalk-comments.ts`，并补充 `use-intersection-visibility.ts`、`src/lib/browser/dom-assets.ts`、`src/lib/browser/theme-observer.ts`、`src/lib/browser/external-links.ts` 等通用浏览器工具，统一脚本加载、暗色观察与外链属性处理。
- 修复 `ArticleComment` 中 Artalk 实例只初始化不销毁的问题，在组件卸载时调用 `destroy()`，同时保留主题同步和懒加载行为。
- 新增 `src/lib/content/tweet-card-cache.ts` 统一 tweet card cache 的共享类型与读取入口，替换 RSS、tweet lookup、搜索索引和 `TweetCard` 组件里重复的 `unknown as` 与局部缓存结构定义。
- 将 `tweet-card.tsx` 里的媒体布局和底部指标拆到 `tweet-card-media-grid.tsx` 与 `tweet-card-footer.tsx`，让主组件聚焦缓存读取、数据兜底和整体卡片结构。
- 收紧 `eslint` 和 `tsconfig`，去掉构建产物干扰和 `allowJs`。
- 修复 `article-card`、`site-header`、`use-article-hits` 等处 effect 内同步 `setState` 的反模式。
- 将一批适合的静态/代理图片替换为 `next/image`，降低组件层面的规范噪音。

## 结果
- `pnpm typecheck` 通过
- `pnpm lint` 通过
- `pnpm build` 通过
- AI 路由、搜索命令和内容脚本三条链路的职责边界更清晰，后续继续做功能迭代时更容易做局部修改和独立测试。
- AI chat 前端的“视图组件 / 浏览器行为 / 错误适配”边界更明确，单文件复杂度进一步下降，后续新增交互时不需要反复改动同一个大组件。
- Footer 和文章页 AI 启动链路里的数据逻辑、缓存逻辑、浏览器工具逻辑进一步解耦，组件层更接近“声明式 UI + 轻交互”的结构。
- Header 与目录组件的文件规模和职责继续收敛，交互型 hook 可以被更多前端模块复用，后续改动不需要反复修改单个大文件。
- About 页现在以服务端安全默认值完成首屏渲染，URL 参数只在挂载后同步，保住静态页面构建能力的同时规避了模型切换首帧不一致的问题。
- 主题系统现在由共享模块统一驱动，后续无论是主题按钮、主题色 meta 还是首屏脚本调整，都不需要在多个文件里重复维护相同常量和逻辑。
- 文章页的“增强层”现在从组件内部散落的 DOM 操作收敛为 hook + 浏览器工具的组合，后续新增 Tweet、评论或外链增强时不需要继续堆到同一个组件文件里。
- 评论系统的生命周期管理更完整，脚本资源、主题同步和第三方实例清理都可单独维护，减少后续接入其他评论/嵌入式组件时的重复实现。
- Tweet cache 相关链路现在共享同一套类型边界和读取入口，后续无论是扩展 RSS、搜索还是 chat tweet 能力，都不需要再分别维护多份近似但不完全一致的缓存定义。
- TweetCard 视图拆分后，媒体布局和指标展示可以单独演进，主组件的空数据兜底、作者信息容错和缓存接入也更容易测试与复用。

## 状态
- [x] 模块边界梳理
- [x] 类型边界收紧
- [x] React 运行时问题修复
- [x] 构建与 lint 验证

---
创建时间: 2026-03-13
最后更新: 2026-03-13
