'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getAlternateLocaleHref,
  getLocalePrefix,
  prefixToLocale,
  stripLocalePrefix,
  withLocalePrefix,
} from '@/lib/i18n/routes';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { siteConfig } from '@/lib/site';
import { THEME_STORAGE_KEY } from '@/lib/theme';

type Theme = 'light' | 'dark';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const cls = document.body.classList;
  return cls.contains('dark') ? 'dark' : 'light';
}

export function Nav() {
  const pathname = usePathname() || '/';
  const localePrefix = getLocalePrefix(pathname);
  const messages = getLocaleMessages(prefixToLocale(localePrefix));
  const basePathname = stripLocalePrefix(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return basePathname === '/';
    return basePathname === href || basePathname.startsWith(`${href}/`);
  };

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.body.className = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    setTheme(next);
  };

  return (
    <nav className="nav">
      <div className="container nav__inner">
        <Link
          href={withLocalePrefix('/', localePrefix)}
          className="nav__logo"
          aria-label={siteConfig.name}
        >
          <span className="nav__logo-name">evo-lee</span>
          <span className="nav__logo-tag">lee刻意进化</span>
        </Link>

        <div className="nav__links">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={withLocalePrefix(item.href, localePrefix)}
              className="nav__link"
              data-active={isActive(item.href) || undefined}
            >
              {messages.nav[item.id]}
            </Link>
          ))}
          <div className="nav__controls">
            <div className="locale-switch" aria-label="切换语言">
              <Link
                href={getAlternateLocaleHref(pathname, '/zh-CN')}
                data-active={localePrefix !== '/en' || undefined}
              >
                中
              </Link>
              <Link
                href={getAlternateLocaleHref(pathname, '/en')}
                data-active={localePrefix === '/en' || undefined}
              >
                EN
              </Link>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? '切换为亮色' : '切换为暗色'}
            >
              {theme === 'dark' ? '☀' : '◐'}
            </button>
          </div>
        </div>

        <div className="nav__hamburger">
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="切换主题">
            {theme === 'dark' ? '☀' : '◐'}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="菜单"
            aria-expanded={mobileOpen}
          >
            <span
              style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }}
            />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span
              style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }}
            />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="nav__mobile">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={withLocalePrefix(item.href, localePrefix)}
              data-active={isActive(item.href) || undefined}
              onClick={() => setMobileOpen(false)}
            >
              {messages.nav[item.id]}
            </Link>
          ))}
          <div className="locale-switch locale-switch--mobile" aria-label="切换语言">
            <Link
              href={getAlternateLocaleHref(pathname, '/zh-CN')}
              data-active={localePrefix !== '/en' || undefined}
              onClick={() => setMobileOpen(false)}
            >
              中
            </Link>
            <Link
              href={getAlternateLocaleHref(pathname, '/en')}
              data-active={localePrefix === '/en' || undefined}
              onClick={() => setMobileOpen(false)}
            >
              EN
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
