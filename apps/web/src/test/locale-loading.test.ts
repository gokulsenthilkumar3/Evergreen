import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => { localStorage.clear(); vi.resetModules(); });
it('loads Tamil on demand and does not undo a language change made while loading', async () => {
  localStorage.setItem('language', 'en');
  vi.resetModules();
  const locale = await import('../i18n');
  expect(locale.uiText('Inventory')).toBe('Inventory');
  const first = locale.loadUiLanguage('ta');
  expect(locale.loadUiLanguage('ta')).toBe(first);
  locale.setUiLanguage('en');
  await first;
  expect(locale.getUiLanguage()).toBe('en');
  expect(locale.uiText('Inventory')).toBe('Inventory');
  locale.setUiLanguage('ta');
  expect(locale.uiText('Inventory')).toBe('சரக்கு');
});
