import { useEffect, useState } from 'react';
import { useLang } from '../i18n/LanguageContext';
import { ui } from '../i18n/ui';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'lfd-theme';

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const { t } = useLang();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      className="toggle-btn"
      onClick={() => setTheme((th) => (th === 'light' ? 'dark' : 'light'))}
      aria-label="Toggle color theme"
    >
      {theme === 'light' ? `🌙 ${t(ui.themeDark)}` : `☀️ ${t(ui.themeLight)}`}
    </button>
  );
}
