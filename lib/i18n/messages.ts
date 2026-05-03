import type { AppLocale } from './config';

const messages = {
  'zh-CN': {
    nav: { home: '首页', posts: '文章', projects: '作品', about: '关于' },
    home: {
      eyebrow: '中国 · 互联网',
      titleTop: '一名独立开发者，',
      titleEm: '在 AI 时代刻意进化。',
      lede: 'AI 时代，是否要主动学习与进化完全掌握在自己手中。我会在这个博客记录自己的学习笔记、开发日志和思考。',
      ticker: [
        '正在阅读：AI 时代的元学习策略',
        '本月已发布 3 篇文章',
        '最新作品：EvoNote 进行中',
        '本周代码提交：12 次',
      ],
      articlesTitle: '文章',
      articlesSubtitle: '记录，公开进行',
      projectsTitle: '作品',
      projectsSubtitle: '正在构建中',
      all: '全部 →',
      emptyPosts: '暂无文章',
      projectStatus: '构建中',
    },
    posts: {
      title: '全部文章',
      description: '所有公开发表的文章列表，可按关键词搜索。',
      count: (count: number) => `共 ${count} 篇`,
    },
    projects: { title: '作品集', description: '正在构建中，敬请期待。', status: '构建中' },
    post: {
      back: '← 返回文章列表',
      missingTitle: '文章不存在',
      homeCrumb: '首页',
      postsCrumb: '文章',
    },
    about: { fallbackTitle: '关于我' },
  },
  en: {
    nav: { home: 'Home', posts: 'Posts', projects: 'Projects', about: 'About' },
    home: {
      eyebrow: 'China · Internet',
      titleTop: 'An independent developer,',
      titleEm: 'deliberately evolving in the AI age.',
      lede: 'In the AI age, learning and evolving remain personal choices. I use this blog to keep notes, development logs, and reflections in public.',
      ticker: [
        'Reading: meta-learning in the AI age',
        '3 posts published this month',
        'Latest work: EvoNote in progress',
        'Code commits this week: 12',
      ],
      articlesTitle: 'Posts',
      articlesSubtitle: 'Notes in public',
      projectsTitle: 'Projects',
      projectsSubtitle: 'In progress',
      all: 'All →',
      emptyPosts: 'No posts yet',
      projectStatus: 'In progress',
    },
    posts: {
      title: 'All Posts',
      description: 'All published posts, searchable by keyword.',
      count: (count: number) => `${count} posts`,
    },
    projects: { title: 'Projects', description: 'In progress. More soon.', status: 'In progress' },
    post: {
      back: '← Back to posts',
      missingTitle: 'Post not found',
      homeCrumb: 'Home',
      postsCrumb: 'Posts',
    },
    about: { fallbackTitle: 'About Me' },
  },
} as const;

export function getLocaleMessages(locale: AppLocale) {
  return messages[locale];
}
