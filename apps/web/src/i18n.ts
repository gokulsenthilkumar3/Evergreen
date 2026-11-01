import { useSyncExternalStore } from 'react';
import { tamil } from './locales/ta';

export type UiLanguage = 'en' | 'ta';
const readSavedLanguage = (): UiLanguage => {
  try { return localStorage.getItem('language') === 'ta' ? 'ta' : 'en'; }
  catch { return 'en'; }
};
let language = readSavedLanguage();
export type UiTextScope = 'navigation' | 'tabs' | 'forms' | 'tables' | 'metrics' | 'charts' | 'feedback' | 'help';
export type TamilPreferences = Record<UiTextScope | 'interface' | 'numbers' | 'currency' | 'dates' | 'grouping' | 'actions' | 'statuses' | 'dateNumbers' | 'currencyDecimals', boolean>;
export const defaultTamilPreferences: TamilPreferences = { interface: true, navigation: true, tabs: true, forms: true, tables: true, metrics: true, charts: true, feedback: true, help: true, numbers: true, currency: true, dates: true, grouping: true, actions: true, statuses: true, dateNumbers: true, currencyDecimals: true };
const defaults = defaultTamilPreferences;
function readPreferences(): TamilPreferences {
  try { const saved = JSON.parse(localStorage.getItem('tamilPreferences') || '{}'); return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, typeof saved[key] === 'boolean' ? saved[key] : value])) as TamilPreferences; }
  catch { return { ...defaults }; }
}
let preferences = readPreferences();
const listeners = new Set<() => void>();
let revision = 0;
const getRevision = () => revision;
export const getUiRevision = getRevision;
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getUiLanguage = () => language;
export function useUiLanguage() { useSyncExternalStore(subscribe, getRevision, () => 0); return language; }
export const useTamilPreferences = () => useSyncExternalStore(subscribe, () => preferences, () => defaults);
export function setTamilPreferences(next: Partial<TamilPreferences>) {
  preferences = { ...preferences, ...next };
  try { localStorage.setItem('tamilPreferences', JSON.stringify(preferences)); } catch { /* Session-only preference. */ }
  revision++;
  listeners.forEach(listener => listener());
}
export const uiLocale = () => language === 'ta' ? (preferences.numbers ? 'ta-IN-u-nu-tamldec' : 'ta-IN') : 'en-IN';
export const uiDateLocale = () => language === 'ta' && preferences.dates ? (preferences.dateNumbers ? 'ta-IN-u-nu-tamldec' : 'ta-IN') : 'en-IN';
export const uiCurrencySymbol = () => language === 'ta' && preferences.currency ? 'ரூ.' : '₹';
export const formatUiNumber = (value: number, options?: Intl.NumberFormatOptions) => value.toLocaleString(uiLocale(), { useGrouping: language === 'ta' ? preferences.grouping : true, ...options });
export const formatUiDate = (value: Date, options?: Intl.DateTimeFormatOptions) => value.toLocaleDateString(uiDateLocale(), options);
export const formatUiCurrency = (value: number, options?: Intl.NumberFormatOptions) => `${uiCurrencySymbol()} ${formatUiNumber(value, { minimumFractionDigits: language === 'ta' && !preferences.currencyDecimals ? 0 : 2, maximumFractionDigits: 2, ...options })}`;
export const formatUiDecimal = (value: number, digits = 0) => formatUiNumber(value, { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
/** For KPI values only; never pass invoice numbers, stock codes or user data here. */
export function uiMetric(value: string | number): string {
  if (typeof value === 'number') return formatUiNumber(value);
  value = value.replace(/[௦-௯]/g, digit => String('௦௧௨௩௪௫௬௭௮௯'.indexOf(digit)));
  if (language !== 'ta') return value;
  let copy = uiText(value, 'metrics');
  if (preferences.interface && preferences.metrics) copy = copy
    .replace(/^([\d.,]+) bags \+ ([\d.,]+) kg loose$/, (_, bags, kg) => uiTemplate`${bags} bags + ${kg} kg loose`)
    .replace(/^([\d.,]+) recorded bales$/, (_, bales) => uiTemplate`${bales} recorded bales`)
    .replace(/^([\d.,]+) kg wasted$/, (_, kg) => uiTemplate`${kg} kg wasted`)
    .replace(/^([\d.,]+) invoices generated$/, (_, count) => uiTemplate`${count} invoices generated`)
    .replace(/^([\d.,]+) accounts with balance$/, (_, count) => uiTemplate`${count} accounts with balance`)
    .replace(/\b(kg|bags|bales|units|orders)\b/g, word => uiText(word, 'metrics'));
  if (!preferences.grouping) copy = copy.replace(/(?<=\d),(?=\d)/g, '');
  if (preferences.numbers) copy = copy.replace(/[0-9]/g, digit => '௦௧௨௩௪௫௬௭௮௯'[Number(digit)]);
  return copy;
}
export function setUiLanguage(next: UiLanguage) {
  language = next;
  try { localStorage.setItem('language', next); } catch { /* Session-only when storage is unavailable. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  revision++;
  listeners.forEach(listener => listener());
}
if (typeof document !== 'undefined') document.documentElement.lang = language;
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  // Storage events already persisted the change. Do not write it back to other tabs.
  if (event.key === 'language' || event.key === null) {
    language = readSavedLanguage();
    if (typeof document !== 'undefined') document.documentElement.lang = language;
  }
  if (event.key === 'tamilPreferences' || event.key === null) preferences = readPreferences();
  if (event.key === 'language' || event.key === 'tamilPreferences' || event.key === null) {
    revision++;
    listeners.forEach(listener => listener());
  }
});

const actionLabels = new Set(['Save', 'Save Changes', 'Cancel', 'Close', 'Delete', 'Edit', 'Add', 'Create', 'Update', 'Remove', 'Clear', 'Clear all', 'Submit', 'Confirm', 'Apply', 'Reset', 'Refresh', 'Search', 'Export', 'Download', 'Print', 'Back', 'Next', 'Continue', 'Retry']);
const statusLabels = new Set(['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled', 'Approved', 'Rejected', 'Draft', 'Posted', 'Paid', 'Unpaid', 'Overdue', 'Open', 'Closed', 'In Progress', 'Delivered', 'Dispatched']);
const actionKeys = new Set([...actionLabels].map(label => label.toLowerCase()));
const statusKeys = new Map([...statusLabels].map(label => [label.toLowerCase(), label]));

/** Translate presentation strings only. Business records and API identifiers stay intact. */
export function uiText(text: string, scope?: UiTextScope): string {
  if (language !== 'ta') return text;
  const key = text.trim().replace(/\s+/g, ' ');
  const categoryKey = key.replaceAll('_', ' ').toLowerCase();
  const categoryEnabled = (!actionKeys.has(categoryKey) || preferences.actions) && (!statusKeys.has(categoryKey) || preferences.statuses);
  const translated = preferences.interface && categoryEnabled && (!scope || preferences[scope]) ? (tamil[key] ?? tamil[statusKeys.get(categoryKey) || '']) : undefined;
  const copy = translated ? text.replace(text.trim(), translated) : text;
  return preferences.currency ? copy.replaceAll('₹', 'ரூ.') : copy;
}

/** Interpolation keeps source records/identifiers out of the translation lookup. */
function interpolate(scope: UiTextScope | undefined, strings: TemplateStringsArray, ...values: unknown[]): string {
  const key = strings.reduce((result, part, index) => result + (index ? `{${index - 1}}` : '') + part, '');
  const copy = uiText(key, scope);
  return copy.replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)] ?? ''));
}
export const uiTemplate = (strings: TemplateStringsArray, ...values: unknown[]) => interpolate(undefined, strings, ...values);
export const uiScopedTemplate = (scope: UiTextScope) => (strings: TemplateStringsArray, ...values: unknown[]) => interpolate(scope, strings, ...values);
