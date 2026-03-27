# Analytics System

English | [简体中文](./analytics-system.zh-CN.md)

## Scope

This document explains the analytics ownership model and runtime event flow.

## Main Files

- `lib/analytics/event-registry.ts`
- `lib/analytics/providers.ts`
- `lib/analytics/track.ts`
- `lib/analytics/route-change-debug.tsx`
- `app/layout.tsx`

## Provider Roles

- Umami:
  reading behavior and editorial interactions
- GA4:
  acquisition and conversion-oriented analysis

Pageviews may be collected by both systems, but custom events are intentionally split by registry ownership.

## Event Flow

1. A component calls `trackEvent(name, params)`.
2. `track.ts` looks up the event definition in `ANALYTICS_EVENT_REGISTRY`.
3. Provider guards decide whether Umami or GA4 is active in the current runtime.
4. The event is dispatched inside `try/catch`.
5. Failures are ignored in production so analytics never break UI behavior.

## Key Functions

### `trackEvent(name, params?)`

- Purpose:
  single entry point for all custom analytics events
- Important behavior:
  unknown events warn only in development
  provider failures are swallowed after optional development logging

### `hasUmami()` and `hasGA4()`

- Purpose:
  prevent provider-specific global checks from leaking into UI components

## Environment Variables

- `NEXT_PUBLIC_ENABLE_UMAMI`
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
- `NEXT_PUBLIC_ENABLE_GA`
- `NEXT_PUBLIC_GA_ID`

## Failure Model

- provider disabled:
  no dispatch happens
- script missing:
  no crash, event call becomes a no-op
- unknown event:
  ignored with a development warning

## Example

```ts
import { trackEvent } from '@/lib/analytics/track';

trackEvent('open_search', {
  source: 'header',
});
```
