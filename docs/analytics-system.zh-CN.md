# 分析系统

[English](./analytics-system.md) | 简体中文

## 说明范围

本文说明分析系统的事件归属模型和运行时上报链路。

## 主要文件

- `lib/analytics/event-registry.ts`
- `lib/analytics/providers.ts`
- `lib/analytics/track.ts`
- `lib/analytics/route-change-debug.tsx`
- `app/layout.tsx`

## Provider 职责

- Umami：
  阅读行为和内容交互
- GA4：
  流量获取与转化分析

Pageview 可以由两套系统都记录，但自定义事件必须通过注册表明确拆分归属。

## 事件链路

1. 组件调用 `trackEvent(name, params)`。
2. `track.ts` 去 `ANALYTICS_EVENT_REGISTRY` 查询事件定义。
3. provider 守卫判断当前环境中 Umami 或 GA4 是否启用。
4. 事件在 `try/catch` 中完成分发。
5. 生产环境里即使失败也会被忽略，保证分析系统不影响 UI。

## 核心函数

### `trackEvent(name, params?)`

- 作用：
  所有自定义分析事件的统一入口
- 关键行为：
  未注册事件只在开发环境警告
  provider 上报失败只记录可选开发日志，不中断页面逻辑

### `hasUmami()` 与 `hasGA4()`

- 作用：
  避免 provider 相关的全局对象判断泄漏到 UI 组件中

## 环境变量

- `NEXT_PUBLIC_ENABLE_UMAMI`
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
- `NEXT_PUBLIC_ENABLE_GA`
- `NEXT_PUBLIC_GA_ID`

## 失败模型

- provider 被禁用：
  不会上报
- 脚本未加载：
  不会崩溃，事件调用退化为 no-op
- 事件未注册：
  忽略，并在开发环境警告

## 示例

```ts
import { trackEvent } from '@/lib/analytics/track';

trackEvent('open_search', {
  source: 'header',
});
```
