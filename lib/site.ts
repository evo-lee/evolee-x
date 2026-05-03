export const siteConfig = {
  name: '刻意进化',
  title: 'evo-lee\'s blog · lee刻意进化',
  description: 'AI 时代，是否要主动学习与进化完全掌握在自己手中。',
  baseUrl: 'https://litang.one',
  locale: 'zh-CN',
  author: 'evolee',
  nav: [
    { href: '/', label: '首页' },
    { href: '/posts', label: '文章' },
    { href: '/projects', label: '作品' },
    { href: '/about', label: '关于' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
