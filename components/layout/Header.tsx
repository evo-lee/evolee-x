import Link from 'next/link';
import { SearchTrigger } from '@/components/ui/SearchTrigger';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { siteConfig } from '@/lib/site';

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-title" href="/">
          {siteConfig.title}
        </Link>
        <div className="site-header__nav-wrap">
          <nav className="site-nav" aria-label="Primary navigation">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="site-header__actions" data-no-typography="true">
            <SearchTrigger />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
