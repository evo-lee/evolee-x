'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/track';
import type { AnalyticsEventName } from '@/lib/analytics/event-registry';

export function TrackedLink({
  href,
  eventName,
  eventParams,
  className,
  children,
  ariaHidden,
  tabIndex,
}: {
  href: string;
  eventName: AnalyticsEventName;
  eventParams?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
  ariaHidden?: boolean;
  tabIndex?: number;
}) {
  return (
    <Link
      href={href}
      className={className}
      aria-hidden={ariaHidden}
      tabIndex={tabIndex}
      onClick={() => trackEvent(eventName, eventParams)}
    >
      {children}
    </Link>
  );
}
