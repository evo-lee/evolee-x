import Link from 'next/link';

export function TagList({
  tags,
  ariaLabel,
}: {
  tags: string[];
  ariaLabel: string;
}) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className="tag-list" aria-label={ariaLabel}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/tags/${tag}`}>#{tag}</Link>
        </li>
      ))}
    </ul>
  );
}
