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
        <main className="error-panel">
          <p className="meta-note">出错了</p>
          <h1>页面加载失败</h1>
          <p>{error.message}</p>
          <button className="chip-link" onClick={() => reset()} type="button">
            重试
          </button>
        </main>
      </body>
    </html>
  );
}
