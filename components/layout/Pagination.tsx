import Link from 'next/link';
import type { AppLocale } from '@/lib/i18n/config';
import { getLocaleMessages } from '@/lib/i18n/messages';

function buildPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export async function Pagination({
  currentPage,
  totalPages,
  basePath,
  locale,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  locale: AppLocale;
}) {
  const messages = getLocaleMessages(locale);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label={messages.pagination.ariaLabel} data-no-typography="true">
      {currentPage > 1 ? (
        <Link className="pagination__link" href={buildPageHref(basePath, currentPage - 1)}>
          {messages.pagination.previous}
        </Link>
      ) : (
        <span className="pagination__link pagination__link--muted">
          {messages.pagination.previous}
        </span>
      )}
      <span className="pagination__status">
        {messages.pagination.status(currentPage, totalPages)}
      </span>
      {currentPage < totalPages ? (
        <Link className="pagination__link" href={buildPageHref(basePath, currentPage + 1)}>
          {messages.pagination.next}
        </Link>
      ) : (
        <span className="pagination__link pagination__link--muted">
          {messages.pagination.next}
        </span>
      )}
    </nav>
  );
}
