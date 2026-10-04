import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UnifiedWorkspace from '../pages/UnifiedWorkspace';
import BusinessFlowGuide from '../components/BusinessFlowGuide';
import api from '../utils/api';

vi.mock('../utils/api', () => ({ default: { get: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const report = { invoicedValue: 2500, receivables: 500, openOrders: 2, lowStock: [], openJobWork: 1 };
function mountWorkspace() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><UnifiedWorkspace onNavigate={vi.fn()} /></QueryClientProvider>);
  return client;
}

describe('workspace business evidence', () => {
  it('shows unavailable data rather than invented zero or operational status', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Offline'));
    const client = mountWorkspace();
    expect(await screen.findByText('HEALTH UNAVAILABLE')).toBeInTheDocument();
    expect(screen.getAllByText('Unavailable')).toHaveLength(4);
    expect(screen.queryByText('ALL SYSTEMS OPERATIONAL')).not.toBeInTheDocument();
    expect(screen.getByText(/Some workspace data could not be refreshed/)).toBeInTheDocument();
    client.clear();
  });
  it('reads the actual register and preserves stale values on a failed refresh', async () => {
    vi.mocked(api.get).mockImplementation(async url => ({ data: String(url).startsWith('/health') ? { status: 'ok' } : url === '/machines' ? [{ id: 1 }, { id: 2 }] : report }));
    const client = mountWorkspace();
    expect(await screen.findByText('₹2,500')).toBeInTheDocument();
    expect(screen.getByText('API HEALTHY')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/machines');
    expect(api.get).not.toHaveBeenCalledWith('/machines/stats');
    vi.mocked(api.get).mockRejectedValue(new Error('Offline'));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh now' }));
    await waitFor(() => expect(screen.getByText(/Some workspace data could not be refreshed/)).toBeInTheDocument());
    expect(screen.getByText('₹2,500')).toBeInTheDocument();
    expect(screen.getByText('HEALTH UNAVAILABLE')).toBeInTheDocument();
    client.clear();
  });
});

describe('shared workflow guide', () => {
  it('navigates to a business step and gives helpful search recovery', () => {
    const navigate = vi.fn();
    render(<BusinessFlowGuide onNavigate={navigate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
    expect(navigate).toHaveBeenCalledWith('settings');
    fireEvent.change(screen.getByLabelText('Search workflow guide'), { target: { value: 'no-such-workflow' } });
    expect(screen.getByRole('status')).toHaveTextContent('No matching steps');
    fireEvent.change(screen.getByLabelText('Search workflow guide'), { target: { value: 'remaining balance' } });
    expect(screen.getByText('Collect and review')).toBeInTheDocument();
    expect(screen.queryByText('Set up your business')).not.toBeInTheDocument();
  });
});
