import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { StructuredData } from '@/components/seo/StructuredData';
import { buildSiteMetadata } from '@/lib/seo/metadata';
import { buildPersonStructuredData } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';
import 'heti/umd/heti.min.css';
import '@/styles/heti-overrides.css';

export const metadata: Metadata = buildSiteMetadata();

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang={siteConfig.locale} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=window.localStorage.getItem('${THEME_STORAGE_KEY}');var theme=stored==='light'||stored==='dark'?stored:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;}catch(e){}})();`,
          }}
        />
        <StructuredData data={buildPersonStructuredData()} />
        {children}
      </body>
    </html>
  );
}
