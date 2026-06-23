import { useLang } from './LanguageContext';

export function LanguageToggle() {
  const { locale, setLocale } = useLang();
  return (
    <div className="seg" role="group" aria-label="Language">
      <button
        className={locale === 'ko' ? 'active' : ''}
        onClick={() => setLocale('ko')}
        aria-pressed={locale === 'ko'}
      >
        한국어
      </button>
      <button
        className={locale === 'en' ? 'active' : ''}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
