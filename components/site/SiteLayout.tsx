import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SearchModal } from '@/components/search/SearchModal';

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <Header />
      <main className="site-main">{children}</main>
      <SearchModal />
      <Footer />
    </div>
  );
}
