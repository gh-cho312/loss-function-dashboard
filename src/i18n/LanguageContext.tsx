import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Locale, LocalizedText } from '../data/types';

type LanguageCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Resolve a LocalizedText (or plain string) for the active locale. */
  t: (text: LocalizedText | string) => string;
};

const Ctx = createContext<LanguageCtx | null>(null);
const STORAGE_KEY = 'lfd-locale';

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'ko';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'en' || saved === 'ko' ? saved : 'ko';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (text: LocalizedText | string) =>
      typeof text === 'string' ? text : text[locale],
    [locale],
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
