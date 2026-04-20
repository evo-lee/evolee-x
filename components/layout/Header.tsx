import Link from 'next/link';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { getLocaleMessages } from '@/lib/i18n/messages';
import { SearchTrigger } from '@/components/ui/SearchTrigger';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getSiteConfig } from '@/lib/site';

export async function Header() {
  const locale = await detectRequestLocale();
  const siteConfig = getSiteConfig(locale);
  const messages = getLocaleMessages(locale);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-title" href="/" style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <span>✿ {siteConfig.title}</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--text-soft)' }}>
            {locale === 'zh-CN' ? 'evolee 的花园笔记' : "evolee's garden of notes"}
          </span>
        </Link>
        <div className="site-header__nav-wrap">
          <nav className="site-nav" aria-label={messages.header.primaryNavigation}>
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="site-header__actions" data-no-typography="true">
            <SearchTrigger label={messages.search.button} title={messages.search.openTitle} />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
