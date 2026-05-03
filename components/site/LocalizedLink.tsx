'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { getLocalePrefix, withLocalePrefix } from '@/lib/i18n/routes';

type LocalizedLinkProps = ComponentProps<typeof Link>;

export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const pathname = usePathname() || '/';
  const localePrefix = getLocalePrefix(pathname);
  const nextHref = typeof href === 'string' ? withLocalePrefix(href, localePrefix) : href;

  return <Link href={nextHref} {...props} />;
}
