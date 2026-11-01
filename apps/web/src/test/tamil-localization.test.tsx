import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defaultTamilPreferences, formatUiCurrency, formatUiDate, formatUiNumber, setTamilPreferences, setUiLanguage, uiMetric, uiTemplate, uiText, useUiLanguage } from '../i18n';
import TamilOptions from '../components/TamilOptions';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_MESSAGES, formatApiError } from '../utils/messages';

function Example() {
  useUiLanguage();
  return <><h1>{uiText('Inventory')}</h1><output aria-label="metric">{uiMetric('₹1,250.50 kg')}</output><output aria-label="currency">{formatUiCurrency(1250.5)}</output><TamilOptions /></>;
}
beforeEach(() => { setUiLanguage('en'); setTamilPreferences({ ...defaultTamilPreferences }); });
afterEach(() => { cleanup(); setUiLanguage('en'); });
describe('Tamil display preferences', () => {
  it('resolves shared notifications at use time and respects the feedback preference', () => {
    expect(SUCCESS_MESSAGES.SAVE).toBe('✓ Saved successfully');
    setUiLanguage('ta');
    expect(SUCCESS_MESSAGES.SAVE).toBe('✓ சேமிக்கப்பட்டது');
    expect(ERROR_MESSAGES.NETWORK).toContain('வலையமைப்புப் பிழை');
    expect(CONFIRM_MESSAGES.DELETE_USER('Acme-123')).toBe('"Acme-123" பயனரை நீக்க விரும்புகிறீர்களா?');
    expect(formatApiError({ response: { data: { message: 'Invalid quantity' } } })).toBe('✗ அளவு தவறானது');
    setTamilPreferences({ feedback: false });
    expect(SUCCESS_MESSAGES.SAVE).toBe('✓ Saved successfully');
    expect(CONFIRM_MESSAGES.DELETE_USER('Acme-123')).toBe('Are you sure you want to delete user "Acme-123"?');
    setUiLanguage('en');
    expect(ERROR_MESSAGES.NETWORK).toBe('✗ Network error. Please check your connection.');
  });
  it('synchronizes language and preferences changed in another tab', () => {
    render(<Example />);
    localStorage.setItem('language', 'ta');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'language' })));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('சரக்கு');
    localStorage.setItem('tamilPreferences', JSON.stringify({ numbers: false, navigation: false }));
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'tamilPreferences' })));
    expect(screen.getByLabelText('currency')).toHaveTextContent('ரூ. 1,250.50');
    expect(uiText('Inventory', 'navigation')).toBe('Inventory');
    act(() => { localStorage.clear(); window.dispatchEvent(new StorageEvent('storage', { key: null })); });
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Inventory');
  });
  it('translates compound metrics and uppercase status values without changing source records', () => {
    setUiLanguage('ta');
    expect(uiMetric('12 bags + 3 kg loose')).toBe('௧௨ மூட்டைகள் + ௩ கிலோ உதிரி');
    expect(uiText('PENDING', 'tables')).toBe(uiText('Pending', 'tables'));
    setTamilPreferences({ statuses: false });
    expect(uiText('PENDING', 'tables')).toBe('PENDING');
  });
  it('keeps date numerals independent of metric numerals and the interface switch', () => {
    setUiLanguage('ta');
    setTamilPreferences({ interface: false, numbers: false, dateNumbers: true });
    expect(formatUiDate(new Date(2026, 10, 1))).toContain('௨௦௨௬');
    setTamilPreferences({ dateNumbers: false });
    expect(formatUiDate(new Date(2026, 10, 1))).toContain('2026');
  });
  it('keeps action and status choices independent and preserves currency precision', () => {
    setUiLanguage('ta');
    setTamilPreferences({ actions: false, statuses: false, currencyDecimals: false });
    expect(uiText('Save', 'forms')).toBe('Save');
    expect(uiText('Pending', 'tables')).toBe('Pending');
    expect(uiText('Inventory', 'navigation')).toBe('சரக்கு');
    expect(formatUiCurrency(100)).toBe('ரூ. ௧௦௦');
    expect(formatUiCurrency(100.75)).toBe('ரூ. ௧௦௦.௭௫');
    setTamilPreferences({ actions: true, statuses: true });
    expect(uiText('Save', 'forms')).not.toBe('Save');
    expect(uiText('Pending', 'tables')).not.toBe('Pending');
  });
  it('updates open controls, metrics, numerals and currency immediately and persists checkbox choices', () => {
    render(<Example />);
    act(() => setUiLanguage('ta'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('சரக்கு');
    expect(screen.getByLabelText('metric')).toHaveTextContent('ரூ.௧,௨௫௦.௫௦ கிலோ');
    expect(screen.getByLabelText('currency')).toHaveTextContent('ரூ. ௧,௨௫௦.௫௦');
    fireEvent.click(screen.getByRole('checkbox', { name: 'அளவீடுகளில் தமிழ் எண்கள் (௧, ௨, ௩)' }));
    expect(screen.getByLabelText('metric')).toHaveTextContent('ரூ.1,250.50 கிலோ');
    fireEvent.click(screen.getByRole('checkbox', { name: 'ரூபாய் குறியீடு தமிழில் (ரூ.)' }));
    expect(screen.getByLabelText('currency')).toHaveTextContent('₹ 1,250.50');
    fireEvent.click(screen.getByRole('checkbox', { name: 'முழு இடைமுகம் மற்றும் தாவல்கள்' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Inventory');
    expect(JSON.parse(localStorage.getItem('tamilPreferences')!)).toEqual(expect.objectContaining({ interface: false, numbers: false, currency: false }));
    act(() => setUiLanguage('en'));
    expect(formatUiNumber(1250)).toBe('1,250');
  });
  it('preserves identifiers and business names in interpolated copy', () => {
    setUiLanguage('ta');
    expect(uiTemplate`Batch Label: ${'BATCH-001'}`).toBe('தொகுதி அட்டை: BATCH-001');
    expect(uiText('Acme Mill 123')).toBe('Acme Mill 123');
  });
  it('changes individual categories and presets without changing the selected language', () => {
    setUiLanguage('ta');
    render(<Example />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(17);
    fireEvent.click(screen.getByRole('checkbox', { name: 'வழிசெலுத்தல் மற்றும் பக்கத் தலைப்புகள்' }));
    expect(uiText('Inventory', 'navigation')).toBe('Inventory');
    expect(uiText('Inventory', 'tabs')).toBe('சரக்கு');
    fireEvent.click(screen.getByRole('checkbox', { name: 'தாவல்கள் மற்றும் பிரிவுகள்' }));
    expect(uiText('Inventory', 'tabs')).toBe('Inventory');
    expect(uiText('Inventory', 'tables')).toBe('சரக்கு');
    fireEvent.click(screen.getByRole('button', { name: 'தமிழ் உரை · வழக்கமான எண்கள்' }));
    expect(formatUiCurrency(1250.5)).toBe('₹ 1,250.50');
    expect(uiText('Inventory', 'navigation')).toBe('சரக்கு');
    fireEvent.click(screen.getByRole('button', { name: 'அனைத்தும் தமிழில்' }));
    expect(screen.getAllByRole('checkbox').every(input => (input as HTMLInputElement).checked)).toBe(true);
    expect(formatUiCurrency(1250.5)).toBe('ரூ. ௧,௨௫௦.௫௦');
  });
});


