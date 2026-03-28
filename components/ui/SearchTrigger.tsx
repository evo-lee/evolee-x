'use client';

import { openSearchModal } from '@/components/search/SearchModal';

export function SearchTrigger({ label, title }: { label: string; title: string }) {
  return (
    <button
      type="button"
      className="control-button"
      aria-haspopup="dialog"
      onClick={() => {
        openSearchModal();
      }}
      title={title}
    >
      {label}
    </button>
  );
}
