import Link from 'next/link';

export function TaxonomyChipList({
  items,
  ariaLabel,
}: {
  items: Array<{
    href: string;
    label: string;
  }>;
  ariaLabel: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="simple-list" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={`${item.href}:${item.label}`}>
          <Link className="chip-link" href={item.href}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
