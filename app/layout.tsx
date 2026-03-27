import type { Metadata } from 'next';
import './globals.css';

// Phase 0 placeholder — will be fully implemented in Phase 2.
// This minimal layout satisfies Next.js's requirement that every app
// must have a root layout exporting html + body elements.

export const metadata: Metadata = {
  title: {
    template: '%s | evolee',
    default: 'evolee — Personal Blog',
  },
  description: 'A personal blog built with Next.js on Cloudflare Workers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
