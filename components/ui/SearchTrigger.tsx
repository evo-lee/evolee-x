'use client';

import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/track';

export function SearchTrigger() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="control-button"
      aria-haspopup="dialog"
      onClick={() => {
        trackEvent('open_search', { destination: '/posts', source: 'header' });
        router.push('/posts');
      }}
      title="Search UI arrives in Phase 8. Opening the post index for now."
    >
      Search
    </button>
  );
}
