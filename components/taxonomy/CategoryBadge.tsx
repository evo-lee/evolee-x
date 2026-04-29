import Link from 'next/link';
import type { AppLocale } from '@/lib/i18n/config';
import { localeHref } from '@/lib/i18n/route';

export function CategoryBadge({
  category,
  locale,
}: {
  category: string;
  locale: AppLocale;
}) {
  return (
    <Link className="category-badge" href={localeHref(locale, `/categories/${encodeURIComponent(category)}`)}>
      {category}
    </Link>
  );
}
