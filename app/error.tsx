'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <div className="error-panel">
          <p className="meta-note">Unexpected error</p>
          <h1>Something failed while rendering this page.</h1>
          <p>{error.message}</p>
          <button className="chip-link" onClick={() => reset()} type="button">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

