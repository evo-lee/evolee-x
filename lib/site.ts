import type { AppLocale } from '@/lib/i18n/config';

const localizedSiteConfig = {
  'zh-CN': {
    name: '刻意进化',
    title: '刻意进化',
    description: '闭门即是深山，读书随处净土',
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
    name: 'evolee\'s work',
    title: 'evolee\'s work',
    description: "Evolee's notes — code, books, and quiet observations.",
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
