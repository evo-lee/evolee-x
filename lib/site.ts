import type { AppLocale } from '@/lib/i18n/config';

const localizedSiteConfig = {
  'zh-CN': {
    name: 'evolee\'s blog',
    title: 'evolee\'s blog',
    description: '编程笔记、阅读记录与个人写作。',
    baseUrl: 'https://litang.one',
    locale: 'zh-CN',
    author: 'evolee',
    nav: [
      { href: '/', label: '首页' },
      { href: '/posts', label: '文章' },
      { href: '/archives', label: '归档' },
      { href: '/about', label: '关于' },
      { href: '/projects', label: '项目' },
    ],
  },
  en: {
    name: 'evolee\'s blog',
    title: 'evolee\'s blog',
    description: 'Programming notes, reading reflections, and personal essays.',
    baseUrl: 'https://litang.one',
    locale: 'en',
    author: 'evolee',
    nav: [
      { href: '/', label: 'Home' },
      { href: '/posts', label: 'Posts' },
      { href: '/archives', label: 'Archives' },
      { href: '/about', label: 'About' },
      { href: '/projects', label: 'Projects' },
    ],
  },
} as const;

export function getSiteConfig(locale: AppLocale) {
  return localizedSiteConfig[locale];
}

export const siteConfig = getSiteConfig('zh-CN');
