import Link from 'next/link';

function buildPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Pagination" data-no-typography="true">
      {currentPage > 1 ? (
        <Link className="pagination__link" href={buildPageHref(basePath, currentPage - 1)}>
          Previous
        </Link>
      ) : (
        <span className="pagination__link pagination__link--muted">Previous</span>
      )}
      <span className="pagination__status">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link className="pagination__link" href={buildPageHref(basePath, currentPage + 1)}>
          Next
        </Link>
      ) : (
        <span className="pagination__link pagination__link--muted">Next</span>
      )}
    </nav>
  );
}
