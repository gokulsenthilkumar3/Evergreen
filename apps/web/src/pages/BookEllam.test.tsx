import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookEllam from './BookEllam';
import api from '../utils/api';
vi.mock('../utils/api', () => ({ default: { get: vi.fn() } }));
let client: QueryClient;
afterEach(() => { cleanup(); client?.clear(); vi.clearAllMocks(); });
const show = () => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><BookEllam /></QueryClientProvider>);
};

it('loads the actual receipt route and displays pending settlement without an invented value', async () => {
  vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/inventory/inward' ? [{ id: 1, batchId: 'LOT-REAL-01', date: '2026-01-01T10:00:00Z', supplier: 'Actual supplier', kg: 10320, weighbridgeReceipt: { moisturePercent: 9.2, finalBillableKg: null } }] : [] }));
  show();
  expect(await screen.findByText('Actual supplier')).toBeInTheDocument();
  expect(screen.getByText(/billable: pending contract/)).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/inventory/inward');
  expect(api.get).toHaveBeenCalledWith('/inventory/outward');
  expect(api.get).not.toHaveBeenCalledWith('/inward');
  expect(screen.queryByText(/1857600/)).not.toBeInTheDocument();
});

it('shows an incomplete-register error when a receipt request fails', async () => {
  vi.mocked(api.get).mockImplementation(async url => { if (url === '/inventory/inward') throw new Error('offline'); return { data: [] }; });
  show();
  expect(await screen.findByText(/totals are incomplete/)).toBeInTheDocument();
});

it('downloads Tally XML through the authenticated client', async () => {
  vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/integrations/tally/export' ? new Blob(['<ENVELOPE/>']) : [] }));
  const createUrl = vi.fn(() => 'blob:tally');
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createUrl });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  show();
  fireEvent.click(screen.getByRole('button', { name: 'Export Sales / Receipts XML' }));
  await waitFor(() => expect(createUrl).toHaveBeenCalled());
  expect(api.get).toHaveBeenCalledWith('/integrations/tally/export', { params: { types: 'Sales,Receipt' }, responseType: 'blob' });
  expect(click).toHaveBeenCalledOnce();
  click.mockRestore();
});
