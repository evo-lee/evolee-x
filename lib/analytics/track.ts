import { ANALYTICS_EVENT_REGISTRY, type AnalyticsEventName } from '@/lib/analytics/event-registry';
import { hasGA4, hasUmami } from '@/lib/analytics/providers';

type AnalyticsWindow = Window & {
  umami?: {
    track?: (name: string, params?: Record<string, unknown>) => void;
  };
  gtag?: (command: string, name: string, params?: Record<string, unknown>) => void;
};

export function trackEvent(name: AnalyticsEventName, params?: Record<string, unknown>) {
  const definition = ANALYTICS_EVENT_REGISTRY[name];

  if (!definition) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[analytics] Unknown event: ${name}`);
    }
    return;
  }

  const runtimeWindow = typeof window !== 'undefined' ? (window as AnalyticsWindow) : null;

  try {
    if ((definition.target === 'umami' || definition.target === 'both') && hasUmami()) {
      runtimeWindow?.umami?.track?.(name, params);
    }

    if ((definition.target === 'ga4' || definition.target === 'both') && hasGA4()) {
      runtimeWindow?.gtag?.('event', name, params || {});
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[analytics] Event dispatch failed.', error);
    }
  }
}
