export const siteConfig = {
  name: 'evolee',
  title: 'evolee',
  description: 'Programming notes, reading reflections, and personal essays.',
  baseUrl: 'https://evolee-x.workers.dev',
  locale: 'zh-CN',
  author: 'evolee',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/posts', label: 'Posts' },
    { href: '/archives', label: 'Archives' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
  ],
} as const;

