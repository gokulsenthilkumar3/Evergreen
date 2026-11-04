import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Integrations from './Integrations';
import api from '../utils/api';
vi.mock('../utils/api', () => ({ default: { get: vi.fn(async () => ({ data: [] })), post: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('requires mapping, a preview, and explicit confirmation before creating records', async () => {
  vi.mocked(api.post).mockImplementation(async url => ({ data: String(url).endsWith('/preview') ? { records: [{ name: 'New customer' }], issues: [], ignoredHeaders: [] } : { id: 3, rowCount: 1, replayed: false } }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const { container } = render(<QueryClientProvider client={client}><Integrations /></QueryClientProvider>);
  fireEvent.change(screen.getByLabelText(/Source name/), { target: { value: 'Old register' } });
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [{ size: 100, text: async () => 'Party heading\nNew customer' }] } });
  await screen.findByText(/1 records - Match your columns/);
  expect(api.post).not.toHaveBeenCalled();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Name/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Party heading' }));
  fireEvent.click(screen.getByRole('button', { name: 'Validate and preview' }));
  const commit = await screen.findByRole('button', { name: 'Import 1 records' });
  expect(commit).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(commit);
  expect(await screen.findByText('Import complete: 1 customers - Batch 3')).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledWith('/integrations/imports/commit', expect.objectContaining({ source: 'Old register', mapping: { name: 0 }, rows: [['New customer']], requestKey: expect.any(String) }));
  client.clear();
});

it('discards an old preview when its source mapping changes', async () => {
  vi.mocked(api.post).mockResolvedValue({ data: { records: [{ name: 'A' }], issues: [], ignoredHeaders: [] } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const { container } = render(<QueryClientProvider client={client}><Integrations /></QueryClientProvider>);
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [{ size: 100, text: async () => 'Name\nA' }] } });
  await screen.findByRole('combobox', { name: /Name/ });
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Name/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Validate and preview' }));
  await screen.findByRole('checkbox');
  fireEvent.change(screen.getByLabelText(/Source name/), { target: { value: 'Another source' } });
  await waitFor(() => expect(screen.queryByRole('checkbox')).not.toBeInTheDocument());
  expect(screen.queryByRole('button', { name: 'Import 1 records' })).not.toBeInTheDocument();
  client.clear();
});
