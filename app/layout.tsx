import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { StructuredData } from '@/components/seo/StructuredData';
import { buildSiteMetadata } from '@/lib/seo/metadata';
import { buildPersonStructuredData } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = buildSiteMetadata();

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang={siteConfig.locale} suppressHydrationWarning>
      <body>
        <StructuredData data={buildPersonStructuredData()} />
        {children}
      </body>
    </html>
  );
}
