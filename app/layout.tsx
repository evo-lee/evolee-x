import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { DM_Mono, DM_Sans, Lora } from 'next/font/google';
import Script from 'next/script';
import { DevTweaksMount } from '@/components/dev/DevTweaksMount';
import { RouteChangeDebug } from '@/lib/analytics/route-change-debug';
import { StructuredData } from '@/components/seo/StructuredData';
import { buildSiteMetadata } from '@/lib/seo/metadata';
import { buildPersonStructuredData } from '@/lib/seo/structured-data';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import './globals.css';
import 'heti/umd/heti.min.css';
import '@/styles/heti-overrides.css';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-dm-mono',
});

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata();
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const enableUmami = process.env.NEXT_PUBLIC_ENABLE_UMAMI === 'true';
  const enableGA = process.env.NEXT_PUBLIC_ENABLE_GA === 'true';
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html
      lang="zh-CN"
      className={`${lora.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {enableUmami && umamiScriptUrl && umamiWebsiteId ? (
          <Script src={umamiScriptUrl} data-website-id={umamiWebsiteId} strategy="afterInteractive" />
        ) : null}
      </head>
      <body className="light">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=window.localStorage.getItem('${THEME_STORAGE_KEY}');var t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.body.className=t;}catch(e){}})();`,
          }}
        />
        <StructuredData data={buildPersonStructuredData()} />
        {children}
        {isDev ? <DevTweaksMount /> : null}
        <Suspense fallback={null}>
          <RouteChangeDebug />
        </Suspense>
      </body>
      {enableGA && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
