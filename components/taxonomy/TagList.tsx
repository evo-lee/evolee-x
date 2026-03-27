import Link from 'next/link';

export function TagList({
  tags,
  ariaLabel,
  compact = false,
}: {
  tags: string[];
  ariaLabel: string;
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
          <Link href={`/tags/${tag}`}>#{tag}</Link>
        </li>
      ))}
    </ul>
  );
}
