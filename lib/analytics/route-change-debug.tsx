'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useRouteChangeDebug() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const query = searchParams?.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      console.info('[analytics] Route changed:', url);
    }
  }, [pathname, searchParams]);
}

export function RouteChangeDebug() {
  useRouteChangeDebug();
  return null;
}
