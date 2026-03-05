export const siteConfig = {
  // Site基本信息
  title: "罗磊的独立博客",
  description:
    "罗磊的独立博客。全栈开发者、ZUOLUOTV 创作者、摄影师和马拉松跑者，分享编程开发、AI 与出海、数码科技、摄影旅行和跑步生活。",
  siteUrl: "https://luolei.org",
  // 用于 Umami data-domains 等需要裸域名列表的场景
  domains: ["luolei.org", "www.luolei.org"],

  // 品牌名（导航栏、YouTube 频道等展示用）
  brand: "ZUOLUOTV",

  // 作者信息
  author: {
    name: "罗磊",
    email: "i@luolei.org",
    github: "foru17",
    twitterUsername: "luoleiorg",
    unsplash: "luolei",
  },

  // 社交链接
  social: {
    github: "https://github.com/foru17",
    twitter: "https://zuoluo.tv/twitter",
    youtube: "https://zuoluo.tv/youtube",
    bilibili: "https://zuoluo.tv/bilibili",
  },

  // AI 聊天相关文案
  ai: {
    chatTitle: "博客 AI 助手",
    chatSubtitle: "罗磊的数字分身",
    welcomeText:
      "你好！我是罗磊，欢迎来到我的博客 👋\n你可以问我关于技术、旅行、摄影、跑步等话题，也可以让我推荐文章给你。",
    triggerText: "想聊聊吗？",
    triggerLabel: "AI 分身",
    placeholders: [
      "推荐几篇你写的热门文章",
      "聊聊你的技术栈",
      "你最近在做什么项目？",
      "你跑过几场马拉松啦？",
    ],
    topics: ["技术", "AI", "前端全栈", "DevOps/Homelab", "摄影", "旅行", "生活方式"],
  },

  // SEO keywords
  keywords: [
    "罗磊",
    "ZUOLUOTV",
    "独立博客",
    "全栈开发",
    "前端",
    "AI",
    "出海",
    "数码科技",
    "摄影",
    "旅行",
    "马拉松",
    "跑步",
    "Shopify",
  ],

  // 统计和分析 (Umami)
  umamiWebsiteId: "185ef031-29b2-49e3-bc50-1c9f80b4e831" as const,
  umamiScriptUrl: "https://u.is26.com/script.js" as const,
  googleAnalyticsId: "G-TG5VK8GPSG" as const,
  analyticsApiUrl: "/api/analytics/hits",

  // 评论系统 (Artalk)
  comments: {
    server: "https://artalk.is26.com",
    siteName: "罗磊的独立博客",
    gravatarMirror: "https://cravatar.cn/avatar/",
  },

  // 备案信息
  beian: "粤ICP备14004235号",

  // 内容仓库（用于编辑链接）
  contentRepo: {
    owner: "foru17",
    repo: "luoleiorg-x",
    branch: "main",
    contentPath: "content/posts",
  },
} as const;

export const categoryMap = [
  { text: "hot", name: "热门", isHome: true },
  { text: "zuoluotv", name: "视频", isHome: true },
  { text: "code", name: "编程", isHome: true },
  { text: "tech", name: "数码", isHome: true },
  { text: "travel", name: "旅行", isHome: true },
  { text: "lifestyle", name: "生活", isHome: true },
  { text: "photography", name: "摄影", isHome: false },
  { text: "run", name: "跑步", isHome: false },
] as const;

export const articlePageSize = 16;
export const hotArticleViews = 5000;
