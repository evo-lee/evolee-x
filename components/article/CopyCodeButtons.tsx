'use client';

import { useEffect } from 'react';

export function CopyCodeButtons({ scope = '[data-article-content]' }: { scope?: string }) {
  useEffect(() => {
    const root = document.querySelector(scope);
    if (!root) return;

    const blocks = Array.from(root.querySelectorAll<HTMLPreElement>('pre'));
    const cleanups: Array<() => void> = [];

    blocks.forEach((pre) => {
      if (pre.dataset.copyAttached === 'true') return;
      pre.dataset.copyAttached = 'true';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'icon-btn';
      button.style.position = 'absolute';
      button.style.top = '8px';
      button.style.right = '8px';
      button.style.fontSize = '11px';
      button.textContent = '复制';

      pre.style.position = 'relative';
      pre.appendChild(button);

      const handler = async () => {
        const code = pre.querySelector('code');
        if (!code) return;
        try {
          await navigator.clipboard.writeText(code.textContent || '');
          button.textContent = '已复制';
          setTimeout(() => {
            button.textContent = '复制';
          }, 1600);
        } catch {
          button.textContent = '复制失败';
        }
      };

      button.addEventListener('click', handler);
      cleanups.push(() => {
        button.removeEventListener('click', handler);
        button.remove();
        delete pre.dataset.copyAttached;
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [scope]);

  return null;
}
