import Link from 'next/link';
import type { AppLocale } from '@/lib/i18n/config';
import { localeHref } from '@/lib/i18n/route';

export function TagList({
  tags,
  ariaLabel,
  locale,
  compact = false,
}: {
  tags: string[];
  ariaLabel: string;
  locale: AppLocale;
  compact?: boolean;
}) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul
      className={compact ? 'tag-list tag-list--compact' : 'tag-list'}
      aria-label={ariaLabel}
      data-no-typography="true"
    >
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={localeHref(locale, `/tags/${encodeURIComponent(tag)}`)}>#{tag}</Link>
        </li>
      ))}
    </ul>
  );
}
