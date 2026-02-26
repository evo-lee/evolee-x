export const siteConfig = {
  // Site基本信息
  title: "罗磊的独立博客",
  description:
    "罗磊的独立博客。全栈开发者、ZUOLUOTV 创作者、摄影师和马拉松跑者，分享编程开发、AI 与出海、数码科技、摄影旅行和跑步生活。",
  siteUrl: "https://luolei.org",

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
  
  // 统计和分析
  analyticsId: "G-TG5VK8GPSG",
  analyticsApiUrl: "https://st.luolei.org/ga",
  
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
