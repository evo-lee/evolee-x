import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Nav } from './Nav';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
