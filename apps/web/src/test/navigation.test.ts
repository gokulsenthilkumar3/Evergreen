import { describe, expect, it } from 'vitest';
import { canonicalPage, SETTINGS_AUDIT_TAB, settingsTabFor } from '../utils/navigation';
describe('consolidated workspace deep links', () => {
  it.each(['customers', 'orders', 'invoicestudio', 'billing'])('routes %s to the existing commercial ledger', page => expect(canonicalPage(page)).toBe('business'));
  it('routes the old ERP hub to the working workspace', () => expect(canonicalPage('yarnerp')).toBe('workspace'));
  it('routes the activity-log link to Settings instead of the 404 screen', () => expect(canonicalPage('logs')).toBe('settings'));
  it('opens Settings on the Audit Logs tab for the activity-log link and on the first tab otherwise', () => {
    expect(settingsTabFor('logs')).toBe(SETTINGS_AUDIT_TAB);
    expect(SETTINGS_AUDIT_TAB).toBe(4);
    for (const page of ['settings', 'dashboard', '', 'toString']) expect(settingsTabFor(page)).toBe(0);
  });
  it('preserves unknown routes for the 404 screen', () => expect(canonicalPage('toString')).toBe('toString'));
});
