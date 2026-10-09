import { describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
vi.mock('../components/command-center/CampusScene', () => ({ default: () => null }));
vi.mock('../utils/api', () => ({ default: { get: vi.fn(async (url: string) => ({ data:
  url === '/dashboard/summary' ? { meta: { totalCotton: 890, cottonBales: 18, totalYarnKg: 120, yarnBags: 2, periodProduction: 120, periodWaste: 0, totalCost: 0 } }
    : url === '/inventory/inward' ? [{ id: 1, batchId: 'B24', kg: 890, bale: 18, date: '2026-10-07' }]
    : url === '/inventory/outward' ? [{ id: 2, totalWeight: 120, customerName: 'Cotton Customer', date: '2026-10-07' }]
    : [] })) } }));
import CommandCenter, { buildFeedEvents, formatQuantity } from './CommandCenter';

describe('Command Center API records', () => {
  it('renders the real inward and outward field names without crashing', () => {
    const events = buildFeedEvents(
      [{ id: 1, batchId: 'B24', kg: 890, bale: 18, date: '2026-10-07' }],
      [{ id: 2, totalWeight: 120, customerName: 'Cotton Customer', date: '2026-10-07' }],
      [], [],
    );
    expect(events.find(e => e.kind === 'inward')).toMatchObject({ title: 'Batch B24 received', subtitle: '890 kg · 18 bales' });
    expect(events.find(e => e.kind === 'dispatch')).toMatchObject({ title: 'Dispatch — 120 kg', subtitle: 'Cotton Customer' });
  });

  it('keeps missing quantities unknown and formats zero correctly', () => {
    expect(formatQuantity(undefined)).toBe('—');
    expect(formatQuantity(NaN)).toBe('—');
    expect(formatQuantity(0)).toBe('0');
    const events = buildFeedEvents([{ id: 1, batchId: 'B24', date: '2026-10-07' }], [], [], []);
    expect(events[0].subtitle).toBe('— kg · — bales');
    expect(events[0].badge).toBeUndefined();
  });

  it('does not label completed inspections as open', () => {
    const events = buildFeedEvents([], [], [], [
      { id: 1, machineId: 1, status: 'COMPLETED', type: 'PERIODIC', date: '2026-10-07' },
      { id: 2, machineId: 1, status: 'PENDING', type: 'PREVENTIVE', date: '2026-10-07' },
    ]);
    expect(events.find(e => e.id === 'insp-1')?.badge).toBeUndefined();
    expect(events.find(e => e.id === 'insp-2')?.badge).toBe('OPEN');
  });

  it('renders the page after API queries resolve with actual receipt records', async () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><CommandCenter /></QueryClientProvider>);
    expect(await screen.findByText('Batch B24 received')).toBeInTheDocument();
    expect(screen.getByText('890 kg · 18 bales')).toBeInTheDocument();
    expect(screen.getByText('Dispatch — 120 kg')).toBeInTheDocument();
    cleanup();
    client.clear();
    scroll.mockRestore();
  });
});
