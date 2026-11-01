import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserManagement from './UserManagement';
import api from '../utils/api';
import { tableToCSV } from '../utils/csvGenerator';
import { defaultTamilPreferences, setTamilPreferences, setUiLanguage } from '../i18n';

vi.mock('../utils/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
vi.mock('../context/ConfirmContext', () => ({ useConfirm: () => ({ confirm: vi.fn() }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../utils/csvGenerator', () => ({ tableToCSV: vi.fn() }));

const users = [
    { id: 1, username: 'admin', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', createdAt: '2026-10-01T10:00:00Z' },
    { id: 2, username: 'operator', name: 'Operator', email: 'operator@example.com', role: 'MODIFIER', createdAt: '2026-10-01T10:00:00Z' },
];
const security = { isTotpEnabled: false, credentials: [], sessions: [], _count: { sessions: 0 }, activity: [] };
let client: QueryClient;

function renderPage(role = 'ADMIN') {
    client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><UserManagement currentUserRole={role} username="admin" /></QueryClientProvider>);
}

beforeEach(() => {
    setUiLanguage('en');
    setTamilPreferences({ ...defaultTamilPreferences });
    vi.resetAllMocks();
    vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/users' ? users : security }));
});
afterEach(() => { cleanup(); client.clear(); setUiLanguage('en'); });

describe('User Management', () => {
    it('combines role filters with search and resets pagination after filtering', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: Array.from({ length: 12 }, (_, i) => ({ ...users[1], id: i + 10, username: `member${i}`, email: `member${i}@example.com`, role: i === 11 ? 'VIEWER' : 'MODIFIER' })) });
        renderPage();
        await screen.findByText('member0@example.com');
        expect(screen.queryByText('member11@example.com')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
        expect(screen.getByText('member11@example.com')).toBeInTheDocument();
        fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter by role' }));
        fireEvent.click(screen.getByRole('option', { name: 'Viewer' }));
        expect(screen.getByText('member11@example.com')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('1 of 12 users');
        fireEvent.change(screen.getByRole('textbox', { name: 'Search users' }), { target: { value: 'missing' } });
        expect(screen.getByRole('button', { name: 'Export filtered users' })).toBeDisabled();
        fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
        expect(screen.getByText('member0@example.com')).toBeInTheDocument();
    });

    it('exports all matching users across pages without credentials', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: Array.from({ length: 12 }, (_, i) => ({ ...users[1], id: i + 10, username: `member${i}`, password: 'never-export-this' })) });
        renderPage();
        await screen.findByRole('button', { name: 'View member0' });
        fireEvent.click(screen.getByRole('button', { name: 'Export filtered users' }));
        const [headers, rows] = vi.mocked(tableToCSV).mock.calls[0];
        expect(rows).toHaveLength(12);
        expect(headers).toContain('Email');
        expect(JSON.stringify(rows)).not.toContain('never-export-this');
    });

    it('sorts by creation date and opens account metadata without modifying the user', async () => {
        vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/users' ? [users[0], { ...users[1], createdAt: '2026-11-01T10:00:00Z', createdBy: 'admin', updatedBy: 'owner', updatedAt: '2026-11-02T10:00:00Z' }] : security }));
        renderPage();
        await screen.findByText('operator@example.com');
        fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Sort users' }));
        fireEvent.click(screen.getByRole('option', { name: 'Newest first' }));
        const rows = within(screen.getByRole('table', { name: 'Users' })).getAllByRole('row');
        expect(rows[1]).toHaveTextContent('operator@example.com');
        fireEvent.click(screen.getByRole('button', { name: 'View operator' }));
        const details = screen.getByRole('dialog', { name: 'Account details' });
        expect(within(details).getByText('owner')).toBeInTheDocument();
        expect(within(details).getByText('Create and update records. Cannot delete records or manage users.')).toBeInTheDocument();
        expect(api.put).not.toHaveBeenCalled();
        fireEvent.click(within(details).getByRole('button', { name: 'Edit User' }));
        expect(screen.getByRole('dialog', { name: 'Edit User' })).toBeInTheDocument();
    });

    it('clears password visibility and input when the user form is closed', async () => {
        renderPage();
        await screen.findByText('operator@example.com');
        fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
        const password = screen.getByLabelText(/^Password/);
        fireEvent.change(password, { target: { value: 'temporary-input' } });
        fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
        expect(password).toHaveAttribute('type', 'text');
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Add User' }));
        expect(screen.getByLabelText(/^Password/)).toHaveValue('');
        expect(screen.getByLabelText(/^Password/)).toHaveAttribute('type', 'password');
    });

    it('updates directory controls and role chips when switching to Tamil', async () => {
        renderPage();
        await screen.findByText('operator@example.com');
        act(() => setUiLanguage('ta'));
        expect(screen.getByRole('combobox', { name: 'பங்கு வாரியாக வடிகட்டு' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'வடிகட்டிய பயனர்களை ஏற்றுமதி செய்' })).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('மொத்தம் ௨ பயனர்களில் ௨ பேர்');
        expect(screen.getByText('operator@example.com')).toBeInTheDocument();
    });
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
