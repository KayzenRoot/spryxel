'use client';

import { useEffect, useState } from 'react';
import { Button } from '@spryxel/ui';

type Theme = 'dark' | 'light';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const documentTheme = document.documentElement.dataset.theme;
    const selected =
      readSavedTheme() ?? (isTheme(documentTheme) ? documentTheme : preferredTheme());
    document.documentElement.dataset.theme = selected;
    setTheme(selected);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      window.localStorage.setItem('spryxel.theme', next);
    } catch {
      // Theme changes remain active for this page even when persistence is blocked.
    }
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

function readSavedTheme(): Theme | null {
  try {
    const saved = window.localStorage.getItem('spryxel.theme');
    return isTheme(saved) ? saved : null;
  } catch {
    return null;
  }
}

function preferredTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function isTheme(value: string | undefined | null): value is Theme {
  return value === 'dark' || value === 'light';
}
