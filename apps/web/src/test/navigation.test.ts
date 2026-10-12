import { describe, expect, it } from 'vitest';
import { canonicalPage } from '../utils/navigation';
describe('consolidated workspace deep links', () => {
  it.each(['customers', 'orders', 'invoicestudio', 'billing'])('routes %s to the existing commercial ledger', page => expect(canonicalPage(page)).toBe('business'));
  it('routes the old ERP hub to the working workspace', () => expect(canonicalPage('yarnerp')).toBe('workspace'));
  it('routes the activity-log link to Settings instead of the 404 screen', () => expect(canonicalPage('logs')).toBe('settings'));
  it('preserves unknown routes for the 404 screen', () => expect(canonicalPage('toString')).toBe('toString'));
});
