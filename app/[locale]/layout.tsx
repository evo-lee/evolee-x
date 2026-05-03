import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/site/SiteShell';
import { isAppLocale } from '@/lib/i18n/config';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  return <SiteShell>{children}</SiteShell>;
}
