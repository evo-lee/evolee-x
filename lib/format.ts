const SITE_LOCALE = 'zh-CN';

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(SITE_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat(SITE_LOCALE, {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatReadTime(text: string): string {
  const charCount = text.length;
  const minutes = Math.max(1, Math.round(charCount / 500));
  return `${minutes} 分钟`;
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
