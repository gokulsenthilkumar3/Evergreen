import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultTamilPreferences, setTamilPreferences, setUiLanguage } from '../i18n';
import { dateKey } from '../utils/dateKey';
import GlassDatePicker from '../components/common/GlassDatePicker';
import CostingEntry from '../pages/CostingEntry';
import api from '../utils/api';

vi.mock('../utils/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));
vi.mock('../context/ConfirmContext', () => ({ useConfirm: () => ({ confirm: async () => true }) }));
const clients: QueryClient[] = [];
beforeEach(() => {
  setUiLanguage('ta');
  setTamilPreferences({ ...defaultTamilPreferences });
  vi.mocked(api.get).mockImplementation(async (url) => ({ data: url === '/settings' ? {} : [] }));
});
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; setUiLanguage('en'); vi.clearAllMocks(); });

describe('locale-independent calendar data', () => {
  it('uses stable local date keys regardless of the display language or numerals', () => {
    const day = new Date(2026, 10, 1, 23, 59);
    expect(dateKey(day)).toBe('2026-11-01');
    expect(dateKey('2026-11-01')).toBe('2026-11-01');
    setUiLanguage('en');
    expect(dateKey(day)).toBe('2026-11-01');
    expect(dateKey('invalid')).toBe('');
  });
  it('localizes the whole calendar independently of interface text and emits ISO dates', () => {
    setTamilPreferences({ interface: false });
    const change = vi.fn();
    render(<GlassDatePicker label="Date" value="2026-11-01" onChange={change} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Date' }), { key: 'Enter' });
    const selected = screen.getByRole('button', { pressed: true });
    expect(selected).toHaveTextContent('௧');
    expect(screen.getByRole('dialog')).toHaveTextContent('நவம்பர்');
    act(() => setTamilPreferences({ dateNumbers: false }));
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button', { pressed: true }));
    expect(change).toHaveBeenCalledWith({ target: { value: '2026-11-01' } });
  });
  it('keeps an existing costing entry matched while switching languages', async () => {
    vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/settings' ? {} : url === '/costing/entries' ? [
      { id: 'cost-1', date: '2026-11-01T12:00:00', category: 'EB (Electricity)', unitsConsumed: '20', ratePerUnit: '10', posted: true },
    ] : [] }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    clients.push(client);
    render(<QueryClientProvider client={client}><CostingEntry initialDate="2026-11-01" /></QueryClientProvider>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'பதிவானது' })).toBeDisabled());
    act(() => setUiLanguage('en'));
    expect(screen.getByRole('button', { name: 'Posted' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pick a date' })).toHaveTextContent('Nov');
  });
});
