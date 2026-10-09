import { describe, expect, it, vi, afterEach } from 'vitest';
import { toast } from 'sonner';
import { productionTimestamp, localTimeValue } from '../utils/productionTiming';
import { handleDeleteGuardError } from '../utils/deleteGuardHandler';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), warning: vi.fn() } }));
afterEach(() => vi.resetAllMocks());

describe('production timing and actionable notifications', () => {
    it('sends the selected local start time as an unambiguous timestamp', () => {
        const timestamp = productionTimestamp('2026-10-06', '12:31:01');
        const local = new Date(timestamp!);
        expect(local.getFullYear()).toBe(2026);
        expect(local.getMonth()).toBe(9);
        expect(local.getDate()).toBe(6);
        expect(localTimeValue(local)).toBe('12:31:01');
        expect(productionTimestamp('2026-10-06', '')).toBeNull();
        expect(productionTimestamp('2026-10-06', '25:00:00')).toBeNull();
    });

    it('uses a short warning and local time instead of a wall of red server text', () => {
        handleDeleteGuardError({ response: { data: { code: 'PRODUCTION_TOO_EARLY', message: 'Long raw server message', earliestStartAt: '2026-10-06T00:01:01Z', trace: { batchNo: 'EG-001' }, redirectTo: '/inward' } } });
        expect(toast.warning).toHaveBeenCalledWith('Choose a later production start', expect.objectContaining({ description: expect.stringContaining('EG-001 is ready from'), action: expect.objectContaining({ label: 'View Inward' }) }));
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('keeps the business error details and navigation action under a concise heading', () => {
        handleDeleteGuardError({ response: { data: { code: 'INWARD_UNDER_PRODUCTION', message: 'Delete the corresponding production entry first.', redirectTo: '/production', trace: { batchNo: 'EG-001' } } } });
        expect(toast.error).toHaveBeenCalledWith('This batch is still used in production', expect.objectContaining({ description: 'Delete the corresponding production entry first.', action: expect.objectContaining({ label: 'View Production' }) }));
    });
});
