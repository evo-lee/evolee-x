'use client';

import { useRouter } from 'next/navigation';

export function SearchTrigger() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="control-button"
      aria-haspopup="dialog"
      onClick={() => router.push('/posts')}
      title="Search UI arrives in Phase 8. Opening the post index for now."
    >
      Search
    </button>
  );
}
