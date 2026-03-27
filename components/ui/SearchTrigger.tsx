'use client';

import { openSearchModal } from '@/components/search/SearchModal';

export function SearchTrigger() {
  return (
    <button
      type="button"
      className="control-button"
      aria-haspopup="dialog"
      onClick={() => {
        openSearchModal();
      }}
      title="Open search"
    >
      Search
    </button>
  );
}
