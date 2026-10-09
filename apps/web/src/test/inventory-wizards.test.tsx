import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from '../context/ConfirmContext';
import InwardEntry from '../pages/InwardEntry';
import ProductionEntry from '../pages/ProductionEntry';
import OutwardEntry from '../pages/OutwardEntry';
import BatchCodeBuilder from '../components/common/BatchCodeBuilder';
import api from '../utils/api';
import { toast } from 'sonner';

vi.mock('../utils/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() } }));
// Icons are decorative here; avoid loading the full icon catalog for workflow tests.
vi.mock('@mui/icons-material', () => {
    const Icon = () => <svg aria-hidden="true" />;
    return Object.fromEntries(['Save', 'Email', 'PictureAsPdf', 'TableView', 'Delete', 'Add', 'WarningAmber', 'MergeType',
        'QrCode2', 'Inventory2Outlined', 'ScaleOutlined', 'PrecisionManufacturingOutlined', 'ArrowBack', 'ArrowForward',
        'LocalShippingOutlined', 'FileDownload', 'Close', 'Autorenew', 'Tag', 'ScheduleOutlined', 'KeyboardArrowUp',
        'KeyboardArrowDown', 'ArrowDropDown', 'Refresh', 'CalendarToday', 'Warning', 'Image', 'Print', 'Download',
        'ContentCopy', 'Inbox', 'SearchOff', 'FilterList', 'ErrorOutline'].map(name => [name, Icon]));
});
afterEach(() => { cleanup(); vi.resetAllMocks(); });

function mount(page: React.ReactNode, batches: object[] = []) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/inventory/available-batches'
        ? batches : url === '/settings' || url === '/inventory/yarn-stock' ? {} : [] }));
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    render(<QueryClientProvider client={client}><ConfirmProvider>{page}</ConfirmProvider></QueryClientProvider>);
    return client;
}

function fillReceipt() {
    fireEvent.change(screen.getByRole('combobox', { name: /Supplier Name/ }), { target: { value: 'Cotton Supplier' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Total Bales/ }), { target: { value: '5' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Total Weight/ }), { target: { value: '500' } });
}

describe('restored inventory wizard controls', () => {
    it('builds a custom reference using the selected date, prefix, and suffix', () => {
        const change = vi.fn();
        const { rerender } = render(<BatchCodeBuilder value="" date="2026-10-01" onChange={change} />);
        fireEvent.click(screen.getByRole('button', { name: 'Build code' }));
        fireEvent.change(screen.getByLabelText('Prefix'), { target: { value: 'EG' } });
        fireEvent.change(screen.getByLabelText('Suffix'), { target: { value: '007' } });
        expect(change).toHaveBeenLastCalledWith('EG-20261001-007');
        rerender(<BatchCodeBuilder value="" date="2026-09-30" onChange={change} />);
        expect(change).toHaveBeenLastCalledWith('EG-20260930-007');
    });

    it('saves the custom batch reference instead of silently discarding it', async () => {
        const client = mount(<InwardEntry userRole="ADMIN" username="Operator" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        fillReceipt();
        fireEvent.click(screen.getByRole('button', { name: 'Manual ID' }));
        fireEvent.change(screen.getByLabelText('Batch ID (Optional)'), { target: { value: ' EG-20261001-007 ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/inventory/inward', expect.objectContaining({ batchId: 'EG-20261001-007', bale: 5, kg: 500 })));
        client.clear();
    });

    it('keeps server numbering when the optional reference is blank', async () => {
        const client = mount(<InwardEntry userRole="ADMIN" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        fillReceipt();
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
        expect(vi.mocked(api.post).mock.calls[0][1]).not.toHaveProperty('batchId');
        client.clear();
    });

    it('saves the live composed code after changing the receipt date without an apply step', async () => {
        const client = mount(<InwardEntry userRole="ADMIN" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        fillReceipt();
        fireEvent.click(screen.getByRole('button', { name: 'Build code' }));
        fireEvent.change(screen.getByLabelText('Prefix'), { target: { value: 'EG' } });
        fireEvent.change(screen.getByLabelText('Suffix'), { target: { value: '005' } });
        fireEvent.change(screen.getByLabelText(/Date/), { target: { value: '2026-10-01' } });
        fireEvent.change(screen.getByLabelText('Receipt time'), { target: { value: '09:30:00' } });
        expect(screen.getByRole('status')).toHaveTextContent('EG-20261001-005');
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/inventory/inward', expect.objectContaining({ date: new Date('2026-10-01T09:30:00').toISOString(), batchId: 'EG-20261001-005' })));
        client.clear();
    });

    it('lets operators return to automatic numbering after composing a code', async () => {
        const client = mount(<InwardEntry userRole="ADMIN" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        fillReceipt();
        fireEvent.click(screen.getByRole('button', { name: 'Build code' }));
        fireEvent.click(screen.getByRole('button', { name: 'Automatic' }));
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
        expect(vi.mocked(api.post).mock.calls[0][1]).not.toHaveProperty('batchId');
        client.clear();
    });

    it('shows a weight error while editing and still blocks invalid receipts', async () => {
        const client = mount(<InwardEntry userRole="ADMIN" />);
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        fillReceipt();
        fireEvent.change(screen.getByRole('spinbutton', { name: /Total Weight/ }), { target: { value: '-1' } });
        expect(screen.getByText('Weight must be greater than 0 kg')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Add Batch' }));
        expect(api.post).not.toHaveBeenCalled();
        client.clear();
    });

    it('lets operators edit over-stock consumption, then explains why they cannot continue', async () => {
        const client = mount(<ProductionEntry userRole="ADMIN" />,
            [{ batchId: 'EG-001', bale: 5, kg: 500, supplier: 'Supplier', originalBale: 5, originalKg: 500, usedKg: 0, usedBale: 0 }]);
        await waitFor(() => expect(client.getQueryData(['availableBatches', new Date().toLocaleDateString('en-CA')])).toHaveLength(1));
        fireEvent.click(screen.getAllByRole('button', { name: 'Add Production' })[0]);
        fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Batch' }));
        fireEvent.click(await screen.findByRole('option', { name: /EG-001/ }));
        fireEvent.change(screen.getByLabelText('Bales consumed'), { target: { value: '6' } });
        fireEvent.change(screen.getByLabelText('Cotton weight'), { target: { value: '100' } });
        expect(screen.getByLabelText('Bales consumed')).toHaveValue(6);
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('6 bales entered; 5 available'));
        expect(api.post).not.toHaveBeenCalled();
        client.clear();
    });

    it('preserves material balance checks and includes intermediate material when saving', async () => {
        const client = mount(<ProductionEntry userRole="ADMIN" />,
            [{ batchId: 'EG-001', bale: 5, kg: 500, supplier: 'Supplier', originalBale: 5, originalKg: 500, usedKg: 0, usedBale: 0 }]);
        await waitFor(() => expect(client.getQueryData(['availableBatches', new Date().toLocaleDateString('en-CA')])).toHaveLength(1));
        fireEvent.click(screen.getAllByRole('button', { name: 'Add Production' })[0]);
        fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Batch' }));
        fireEvent.click(await screen.findByRole('option', { name: /EG-001/ }));
        fireEvent.change(screen.getByLabelText('Bales consumed'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Cotton weight'), { target: { value: '100' } });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        fireEvent.change(screen.getByLabelText('Yarn weight'), { target: { value: '90' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Production' }));
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('differs by 10.00 kg'));
        expect(api.post).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('tab', { name: 'Intermediate' }));
        fireEvent.change(screen.getByLabelText('Intermediate Weight (kg)'), { target: { value: '10' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Production' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/production', expect.objectContaining({ totalConsumed: 100, totalProduced: 90, intermediate: 10 })));
        const savedDate = (vi.mocked(api.post).mock.calls[0][1] as { date: string }).date;
        expect(savedDate).toMatch(/T\d{2}:\d{2}:\d{2}\.000Z$/);
        client.clear();
    });

    it('explains receipt timing before continuing and preserves quantities while correcting the time', async () => {
        const receivedAt = new Date('2026-10-01T09:00:00').toISOString();
        const earliestStartAt = new Date('2026-10-01T09:01:01').toISOString();
        const client = mount(<ProductionEntry userRole="ADMIN" />,
            [{ batchId: 'EG-001', bale: 5, kg: 500, supplier: 'Supplier', originalBale: 5, originalKg: 500, usedKg: 0, usedBale: 0, receivedAt, earliestStartAt }]);
        await waitFor(() => expect(client.getQueryData(['availableBatches', new Date().toLocaleDateString('en-CA')])).toHaveLength(1));
        fireEvent.click(screen.getAllByRole('button', { name: 'Add Production' })[0]);
        fireEvent.change(screen.getByLabelText('Production Date'), { target: { value: '2026-10-01' } });
        fireEvent.change(screen.getByLabelText('Production start time'), { target: { value: '09:00:00' } });
        await waitFor(() => expect(client.getQueryData(['availableBatches', '2026-10-01'])).toHaveLength(1));
        fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Batch' }));
        fireEvent.click(await screen.findByRole('option', { name: /EG-001/ }));
        fireEvent.change(screen.getByLabelText('Bales consumed'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Cotton weight'), { target: { value: '100' } });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByText('Choose a later production start')).toBeInTheDocument();
        expect(screen.getByText('Earliest production start')).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Edit start time' }));
        expect(screen.getByLabelText('Production start time')).toHaveFocus();
        expect(screen.getByLabelText('Cotton weight')).toHaveValue(100);
        fireEvent.change(screen.getByLabelText('Production start time'), { target: { value: '09:02:00' } });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByLabelText('Yarn weight')).toBeInTheDocument();
        client.clear();
    });

    it('shows the actual vehicle validation in the dispatch form', () => {
        const client = mount(<OutwardEntry userRole="ADMIN" />);
        fireEvent.click(screen.getByRole('button', { name: /Add Outward/ }));
        fireEvent.change(screen.getByLabelText(/Vehicle No/), { target: { value: 'INVALID' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
        expect(screen.getByText('Invalid format. Use: TN 01 AB 1234')).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
        client.clear();
    });

    it('keeps the draft and offers time correction when the API rejects a production start', async () => {
        const client = mount(<ProductionEntry userRole="ADMIN" />,
            [{ batchId: 'EG-001', bale: 5, kg: 500, supplier: 'Supplier', originalBale: 5, originalKg: 500, usedKg: 0, usedBale: 0 }]);
        await waitFor(() => expect(client.getQueryData(['availableBatches', new Date().toLocaleDateString('en-CA')])).toHaveLength(1));
        fireEvent.click(screen.getAllByRole('button', { name: 'Add Production' })[0]);
        fireEvent.change(screen.getByLabelText('Production Date'), { target: { value: '2026-10-01' } });
        fireEvent.change(screen.getByLabelText('Production start time'), { target: { value: '09:00:00' } });
        await waitFor(() => expect(client.getQueryData(['availableBatches', '2026-10-01'])).toHaveLength(1));
        fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select Batch' }));
        fireEvent.click(await screen.findByRole('option', { name: /EG-001/ }));
        fireEvent.change(screen.getByLabelText('Bales consumed'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Cotton weight'), { target: { value: '100' } });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        fireEvent.change(screen.getByLabelText('Yarn weight'), { target: { value: '100' } });
        vi.mocked(api.post).mockRejectedValueOnce({ response: { data: { code: 'PRODUCTION_TOO_EARLY', trace: { batchNo: 'EG-001' }, inwardReceivedAt: new Date('2026-10-01T09:00:00').toISOString(), earliestStartAt: new Date('2026-10-01T09:01:01').toISOString(), message: 'Batch must settle before production.' } } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Production' }));
        expect(await screen.findByText('Choose a later production start')).toBeInTheDocument();
        expect(screen.getByLabelText('Yarn weight')).toHaveValue(100);
        fireEvent.click(screen.getByRole('button', { name: 'Edit start time' }));
        expect(screen.getByLabelText('Production start time')).toHaveFocus();
        expect(screen.getByLabelText('Cotton weight')).toHaveValue(100);
        fireEvent.change(screen.getByLabelText('Production start time'), { target: { value: '09:02:00' } });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        fireEvent.click(screen.getByRole('button', { name: 'Save Production' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
        expect(vi.mocked(api.post).mock.calls[1][1]).toEqual(expect.objectContaining({ date: new Date('2026-10-01T09:02:00').toISOString(), totalProduced: 100 }));
        client.clear();
    }, 15000);
});
