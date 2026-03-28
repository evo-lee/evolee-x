import type { AppLocale } from '@/lib/i18n/config';

export function formatDate(date: Date, locale: AppLocale = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatMonth(date: Date, locale: AppLocale = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

export function groupPostsByMonth<T extends { date: Date }>(items: T[]): Array<{
  key: string;
  items: T[];
}> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
    groups.set(key, [...(groups.get(key) || []), item]);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, groupedItems]) => ({
      key,
      items: groupedItems.sort((a, b) => b.date.getTime() - a.date.getTime()),
    }));
}
