import Link from 'next/link';

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Link className="category-badge" href={`/categories/${category}`}>
      {category}
    </Link>
  );
}
