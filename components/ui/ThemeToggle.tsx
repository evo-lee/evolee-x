'use client';

import { useEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/theme';

type Theme = 'light' | 'dark';

function resolveTheme(): Theme {
  if (typeof document === 'undefined') {
    return 'light';
  }

  const current = document.documentElement.dataset.theme;
  if (current === 'light' || current === 'dark') {
    return current;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(resolveTheme());
  }, []);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="control-button"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => {
        const value = nextTheme;
        document.documentElement.dataset.theme = value;
        window.localStorage.setItem(THEME_STORAGE_KEY, value);
        setTheme(value);
      }}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
