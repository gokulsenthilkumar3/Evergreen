// @polsia:user-owned — locale toggle + useT() hook for the bilingual waitlist section.
'use client';

import * as React from 'react';
import type { Dict } from '@/lib/dictionaries/en';
import { en } from '@/lib/dictionaries/en';
import { ta } from '@/lib/dictionaries/ta';

type Locale = 'en' | 'ta';
const STORAGE_KEY = 'noolstitch_locale';
const LOCALES: Locale[] = ['en', 'ta'];
const DICTS: Record<Locale, Dict> = { en, ta };

function readStoredLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'en';
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return LOCALES.includes(val as Locale) ? (val as Locale) : 'en';
  } catch {
    return 'en';
  }
}

function writeStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // storage unavailable — locale change is still reflected via module state
  }
}

// Module-level signal so multiple useT() calls share one locale state.
const listeners = new Set<() => void>();
let _locale: Locale = 'en';

function getLocale(): Locale {
  return _locale;
}

function useLocaleState(): [Locale, (l: Locale) => void] {
  const [locale, setLocaleState] = React.useState<Locale>('en');

  React.useEffect(() => {
    const stored = readStoredLocale();
    _locale = stored;
    setLocaleState(stored);
    const notify = () => setLocaleState(getLocale());
    listeners.add(notify);
    return () => {
      listeners.delete(notify);
    };
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    _locale = l;
    writeStoredLocale(l);
    for (const fn of listeners) fn();
    document.documentElement.lang = l;
  }, []);

  return [locale, setLocale];
}

/** useT returns a translation function for the current locale. */
export function useT(): (key: keyof Dict) => string {
  const [locale] = useLocaleState();
  return React.useCallback(
    (key: keyof Dict) => DICTS[locale][key] ?? DICTS.en[key] ?? key,
    [locale],
  );
}

/** useLocale returns [currentLocale, setLocale] */
export function useLocale(): [Locale, (l: Locale) => void] {
  return useLocaleState();
}

/** LocaleToggle renders EN | தமிழ் buttons. */
export function LocaleToggle({ className }: { className?: string }) {
  const [locale, setLocale] = useLocaleState();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 ${className ?? ''}`}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`rounded px-3 py-1 text-small font-medium transition-colors ${
          locale === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={locale === 'en'}
        lang="en"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('ta')}
        className={`rounded px-3 py-1 text-small font-medium transition-colors ${
          locale === 'ta'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={locale === 'ta'}
        lang="ta"
      >
        தமிழ்
      </button>
    </div>
  );
}
