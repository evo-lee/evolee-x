'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics/track';

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="copy-code-button"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        trackEvent('copy_code', { location: 'article_code_block' });
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
