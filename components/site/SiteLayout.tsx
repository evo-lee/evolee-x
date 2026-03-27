import Link from 'next/link';
import type { ReactNode } from 'react';
import { siteConfig } from '@/lib/site';

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-title" href="/">
            {siteConfig.title}
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>{siteConfig.description}</p>
          <p>Built with Next.js and Cloudflare Workers.</p>
        </div>
      </footer>
    </div>
  );
}

