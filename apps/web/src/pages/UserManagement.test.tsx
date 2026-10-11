import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserManagement from './UserManagement';
import api from '../utils/api';

vi.mock('../utils/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
vi.mock('../context/ConfirmContext', () => ({ useConfirm: () => ({ confirm: vi.fn() }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const users = [
    { id: 1, username: 'admin', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', createdAt: '2026-10-01T10:00:00Z' },
    { id: 2, username: 'operator', name: 'Operator', email: 'operator@example.com', role: 'MODIFIER', createdAt: '2026-10-01T10:00:00Z' },
];
let client: QueryClient;

function renderPage(role = 'ADMIN') {
    client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><UserManagement currentUserRole={role} username="admin" /></QueryClientProvider>);
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: users });
});
afterEach(() => { cleanup(); client.clear(); });

describe('User Management', () => {
    it('does not request user records for a non-administrator', () => {
        renderPage('VIEWER');
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(api.get).not.toHaveBeenCalled();
    });

    it('shows a recoverable error instead of an empty user list', async () => {
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Offline'));
        renderPage();
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load users');
        expect(screen.queryByText('No users yet. Add a user to get started.')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
        expect(await screen.findByText('operator@example.com')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('searches email addresses and clears an empty search result', async () => {
        renderPage();
        await screen.findByText('operator@example.com');
        expect(screen.getByText('Modifiers')).toBeInTheDocument();
        fireEvent.change(screen.getByRole('textbox', { name: 'Search users' }), { target: { value: '  OPERATOR@  ' } });
        expect(screen.getByText('operator@example.com')).toBeInTheDocument();
        expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
        fireEvent.change(screen.getByRole('textbox', { name: 'Search users' }), { target: { value: 'missing' } });
        expect(screen.getByText('No users match your search.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    it('disables self deletion and last-administrator demotion', async () => {
        renderPage();
        expect(await screen.findByRole('button', { name: 'Delete admin' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete operator' })).toBeEnabled();
        fireEvent.click(screen.getByRole('button', { name: 'Edit admin' }));
        expect(screen.getByRole('combobox', { name: 'Role' })).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByText('The last administrator must keep the Admin role.')).toBeInTheDocument();
    });

    it('preserves the password when editing and locks the form while saving', async () => {
        vi.mocked(api.put).mockImplementation(() => new Promise(() => {}));
        renderPage();
        fireEvent.click(await screen.findByRole('button', { name: 'Edit operator' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Full Name' }), { target: { value: 'Updated Operator' } });
        fireEvent.click(screen.getByRole('button', { name: 'Update User' }));
        await waitFor(() => expect(api.put).toHaveBeenCalledWith('/users/2', {
            username: 'operator', name: 'Updated Operator', email: 'operator@example.com', role: 'MODIFIER',
        }));
        expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        expect(screen.getByRole('textbox', { name: 'Full Name' })).toBeDisabled();
    });
});
