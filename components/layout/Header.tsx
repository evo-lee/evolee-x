import Link from 'next/link';
import type { AppLocale } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { localeHref } from '@/lib/i18n/route';
import { LocaleToggle } from '@/components/ui/LocaleToggle';
import { SearchTrigger } from '@/components/ui/SearchTrigger';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getSiteConfig } from '@/lib/site';

export async function Header({ locale }: { locale: AppLocale }) {
  const siteConfig = getSiteConfig(locale);
  const messages = getLocaleMessages(locale);
  const nav = siteConfig.nav.map((item) => ({ ...item, href: localeHref(locale, item.href) }));

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          className="site-title"
          href={localeHref(locale, '/')}
          style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}
        >
          <span>✿ {siteConfig.title}</span>
          <span className="site-title__sub">{messages.header.subtitle}</span>
        </Link>
        <div className="site-header__nav-wrap">
          <nav className="site-nav" aria-label={messages.header.primaryNavigation}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="site-header__actions" data-no-typography="true">
            <SearchTrigger label={messages.search.button} title={messages.search.openTitle} />
            <LocaleToggle
              currentLocale={locale}
              ariaLabel={messages.header.localeToggle.ariaLabel}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
