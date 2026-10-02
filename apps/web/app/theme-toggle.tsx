'use client';

import { useEffect, useState } from 'react';
import { Button } from '@spryxel/ui';

type Theme = 'dark' | 'light';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = window.localStorage.getItem('spryxel.theme');
    const selected: Theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    document.documentElement.dataset.theme = selected;
    setTheme(selected);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('spryxel.theme', next);
    setTheme(next);
  }

  return (
    <Button
      variant="secondary"
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? 'Light theme' : 'Dark theme'}
    </Button>
  );
}
