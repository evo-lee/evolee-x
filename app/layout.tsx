import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Fraunces, Noto_Serif_SC } from 'next/font/google';
import Script from 'next/script';
import { RouteChangeDebug } from '@/lib/analytics/route-change-debug';
import { StructuredData } from '@/components/seo/StructuredData';
import { detectRequestLocale } from '@/lib/i18n/detect';
import { buildSiteMetadata } from '@/lib/seo/metadata';
import { buildPersonStructuredData } from '@/lib/seo/structured-data';
import { getSiteConfig } from '@/lib/site';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';
import 'heti/umd/heti.min.css';
import '@/styles/heti-overrides.css';

const notoSerifSC = Noto_Serif_SC({
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-serif-sc',
});

const fraunces = Fraunces({
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectRequestLocale();
  return buildSiteMetadata(locale);
}
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await detectRequestLocale();
  const siteConfig = getSiteConfig(locale);
  const enableUmami = process.env.NEXT_PUBLIC_ENABLE_UMAMI === 'true';
  const enableGA = process.env.NEXT_PUBLIC_ENABLE_GA === 'true';
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={siteConfig.locale} className={`${notoSerifSC.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {enableUmami && umamiScriptUrl && umamiWebsiteId ? (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=window.localStorage.getItem('${THEME_STORAGE_KEY}');var theme=stored==='light'||stored==='dark'?stored:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;}catch(e){}})();`,
          }}
        />
        <StructuredData data={buildPersonStructuredData(locale)} />
        {children}
        <Suspense fallback={null}>
          <RouteChangeDebug />
        </Suspense>
      </body>
      {enableGA && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
