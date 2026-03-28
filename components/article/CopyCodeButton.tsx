'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics/track';

export function CopyCodeButton({
  code,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
}: {
  code: string;
  copyLabel?: string;
  copiedLabel?: string;
}) {
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
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
