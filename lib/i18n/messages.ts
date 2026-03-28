import type { AppLocale } from './config';

const localeMessages = {
  'zh-CN': {
    header: {
      primaryNavigation: '主导航',
    },
    footer: {
      builtWith: '基于 Next.js 与 Cloudflare Workers 构建。',
    },
    pagination: {
      ariaLabel: '分页',
      previous: '上一页',
      next: '下一页',
      status: (currentPage: number, totalPages: number) =>
        `第 ${currentPage} 页，共 ${totalPages} 页`,
    },
    search: {
      button: '搜索',
      openTitle: '打开搜索',
      dialogLabel: '搜索文章',
      eyebrow: '搜索',
      closeAriaLabel: '关闭搜索',
      placeholder: '搜索标题、摘要、标签、分类……',
      unavailable: '搜索索引暂时不可用。',
      failed: '搜索加载失败，请重试。',
      emptyHint: '输入标题、标签、分类或摘要里的关键词。',
      searching: '搜索中……',
      noMatches: (query: string) => `没有找到“${query}”的相关结果。`,
      resultsAriaLabel: '搜索结果',
    },
    article: {
      postEyebrow: '文章',
      metadataAriaLabel: '文章信息',
      tocAriaLabel: '目录',
      tocTitle: '本页目录',
      relatedEyebrow: '相关文章',
      relatedTitle: '继续阅读',
      tagsAriaLabel: (title: string) => `${title} 标签`,
    },
    pages: {
      home: {
        title: '首页',
        description: '编程笔记、阅读记录与个人写作。',
      },
      posts: {
        metadataTitle: '文章',
        metadataDescription: '所有已发布文章。',
        eyebrow: '文章',
        title: '全部文章',
        description: '按时间整理的编程、阅读和生活记录。',
        empty: '还没有已发布的文章。',
      },
      archives: {
        metadataTitle: '归档',
        metadataDescription: '按月份浏览文章。',
        eyebrow: '归档',
        title: '月度索引',
        description: '按时间整理的文章归档。',
      },
      category: {
        metadataTitle: (category: string) => `分类：${category}`,
        metadataDescription: (category: string) => `${category} 分类下的文章。`,
        eyebrow: '分类',
        description: '同一主题下的文章集合。',
        empty: (category: string) => `“${category}”分类下还没有文章。`,
      },
      tag: {
        metadataTitle: (tag: string) => `标签：${tag}`,
        metadataDescription: (tag: string) => `带有 ${tag} 标签的文章。`,
        eyebrow: '标签',
        description: '按共同标签整理的文章。',
        empty: (tag: string) => `还没有带“${tag}”标签的文章。`,
      },
      about: {
        fallbackTitle: '关于',
        eyebrow: '关于',
      },
      projects: {
        metadataTitle: '项目',
        metadataDescription: '当前和未来的项目。',
        eyebrow: '项目',
        title: '进行中的事情',
        description: '用于放置实验、已发布工具和进行中工作的页面。',
        empty: '暂时还没有已发布的项目条目，后续会补充。',
      },
      post: {
        notFoundTitle: '文章未找到',
        homeCrumb: '首页',
        postsCrumb: '文章',
      },
      notFound: {
        title: '页面不存在',
        description: '这个地址暂时没有可显示的页面。',
        backHome: '返回首页',
      },
      loading: {
        eyebrow: '加载中',
        title: '正在准备页面……',
        description: '内容和页面结构正在加载。',
      },
      error: {
        eyebrow: '发生错误',
        title: '页面渲染时出了点问题。',
        retry: '再试一次',
      },
    },
    actions: {
      copy: '复制',
      copied: '已复制',
    },
  },
  en: {
    header: {
      primaryNavigation: 'Primary navigation',
    },
    footer: {
      builtWith: 'Built with Next.js and Cloudflare Workers.',
    },
    pagination: {
      ariaLabel: 'Pagination',
      previous: 'Previous',
      next: 'Next',
      status: (currentPage: number, totalPages: number) =>
        `Page ${currentPage} of ${totalPages}`,
    },
    search: {
      button: 'Search',
      openTitle: 'Open search',
      dialogLabel: 'Search posts',
      eyebrow: 'Search',
      closeAriaLabel: 'Close search',
      placeholder: 'Search titles, summaries, tags, categories…',
      unavailable: 'Search index is unavailable right now.',
      failed: 'Search failed to load. Try again.',
      emptyHint: 'Type a title, tag, category, or phrase from a summary.',
      searching: 'Searching…',
      noMatches: (query: string) => `No matches for “${query}”.`,
      resultsAriaLabel: 'Search results',
    },
    article: {
      postEyebrow: 'Post',
      metadataAriaLabel: 'Post metadata',
      tocAriaLabel: 'Table of contents',
      tocTitle: 'On this page',
      relatedEyebrow: 'Related',
      relatedTitle: 'Continue reading',
      tagsAriaLabel: (title: string) => `${title} tags`,
    },
    pages: {
      home: {
        title: 'Home',
        description: 'Programming notes, reading reflections, and personal essays.',
      },
      posts: {
        metadataTitle: 'Posts',
        metadataDescription: 'All published posts.',
        eyebrow: 'Posts',
        title: 'All writing',
        description: 'Chronological notes on software, books, and whatever else proved worth keeping.',
        empty: 'No published posts yet.',
      },
      archives: {
        metadataTitle: 'Archives',
        metadataDescription: 'Browse posts by month.',
        eyebrow: 'Archives',
        title: 'Monthly index',
        description: 'A chronological shelf of published writing.',
      },
      category: {
        metadataTitle: (category: string) => `Category: ${category}`,
        metadataDescription: (category: string) => `Posts filed under ${category}.`,
        eyebrow: 'Category',
        description: 'A quiet shelf for related entries.',
        empty: (category: string) => `No posts in "${category}" yet.`,
      },
      tag: {
        metadataTitle: (tag: string) => `Tag: ${tag}`,
        metadataDescription: (tag: string) => `Posts tagged with ${tag}.`,
        eyebrow: 'Tag',
        description: 'Posts collected under a shared topic.',
        empty: (tag: string) => `No posts tagged with "${tag}" yet.`,
      },
      about: {
        fallbackTitle: 'About',
        eyebrow: 'About',
      },
      projects: {
        metadataTitle: 'Projects',
        metadataDescription: 'Current and upcoming work.',
        eyebrow: 'Projects',
        title: 'Things in progress',
        description:
          'A placeholder shelf for experiments, shipped tools, and works still taking shape.',
        empty:
          'No project entries are published yet. This page is ready for structured content in a later phase.',
      },
      post: {
        notFoundTitle: 'Post not found',
        homeCrumb: 'Home',
        postsCrumb: 'Posts',
      },
      notFound: {
        title: 'Page not found',
        description: 'There is no published page at this address yet.',
        backHome: 'Return home',
      },
      loading: {
        eyebrow: 'Loading',
        title: 'Preparing the page…',
        description: 'The content and route shell are loading now.',
      },
      error: {
        eyebrow: 'Unexpected error',
        title: 'Something failed while rendering this page.',
        retry: 'Try again',
      },
    },
    actions: {
      copy: 'Copy',
      copied: 'Copied',
    },
  },
} as const;

export function getLocaleMessages(locale: AppLocale) {
  return localeMessages[locale];
}
