import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import UserSecurityInspector from './UserSecurityInspector';
import api from '../utils/api';
import { setUiLanguage } from '../i18n';
const { confirm } = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock('../context/ConfirmContext', () => ({ useConfirm: () => ({ confirm }) }));
vi.mock('../utils/api', () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
let client: QueryClient;
beforeEach(() => {
  vi.resetAllMocks(); setUiLanguage('en');
  vi.mocked(api.get).mockResolvedValue({ data: { isTotpEnabled: true, credentials: [], sessions: [{ id: 's1', device: 'Laptop', isValid: true, createdAt: '2026-11-01', lastActive: '2026-11-01' }], _count: { sessions: 1 }, activity: [] } });
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
});
afterEach(() => { cleanup(); client.clear(); });
function mount() { render(<QueryClientProvider client={client}><UserSecurityInspector userId={7} username="staff" /></QueryClientProvider>); }
it('requires a reason and confirmation before account-wide revocation', async () => {
  mount(); await screen.findByText('Laptop');
  expect(screen.getByRole('button', { name: 'Revoke all user sessions' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Revocation reason' }), { target: { value: 'Offboarding' } });
  confirm.mockResolvedValueOnce(false);
  fireEvent.click(screen.getByRole('button', { name: 'Revoke all user sessions' }));
  await waitFor(() => expect(confirm).toHaveBeenCalled());
  expect(api.post).not.toHaveBeenCalled();
  confirm.mockResolvedValueOnce(true); vi.mocked(api.post).mockResolvedValue({ data: { revoked: 1 } });
  fireEvent.click(screen.getByRole('button', { name: 'Revoke all user sessions' }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/users/7/revoke-sessions', { reason: 'Offboarding' }));
  expect(await screen.findByText('Session revocation recorded.')).toBeInTheDocument();
});
it('revokes a selected session without revoking every account session', async () => {
  confirm.mockResolvedValue(true); vi.mocked(api.delete).mockResolvedValue({ data: {} });
  mount(); await screen.findByText('Laptop');
  fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
  await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/sessions/s1/revoke'));
  expect(api.post).not.toHaveBeenCalled();
});
it('shows a recoverable error when security data is unavailable', async () => {
  vi.mocked(api.get).mockRejectedValueOnce(new Error('Offline'));
  mount(); expect(await screen.findByRole('alert')).toHaveTextContent('Could not load security details');
  expect(screen.queryByRole('button', { name: 'Revoke all user sessions' })).not.toBeInTheDocument();
});
