import { describe, expect, it } from 'vitest';
import { BUSINESS_MODES, isCompanyPageVisible, normalizeCompanyProfile } from '@evergreen/types';

describe('company workspace navigation', () => {
  it('preserves all existing navigation when settings have not been upgraded', () => {
    expect(normalizeCompanyProfile()).toEqual({ businessMode: 'INTEGRATED', workspaceMode: 'FULL' });
    expect(isCompanyPageVisible('command-center')).toBe(true);
  });
  it('gives a processing business job work without mill intake clutter', () => {
    const profile = { businessMode: 'PROCESSING', workspaceMode: 'GUIDED' } as const;
    expect(isCompanyPageVisible('jobwork', profile)).toBe(true);
    expect(isCompanyPageVisible('inward', profile)).toBe(false);
    expect(isCompanyPageVisible('production', profile)).toBe(false);
  });
  it('gives warehouse businesses storage without machinery or payroll', () => {
    const profile = { businessMode: 'WAREHOUSE', workspaceMode: 'GUIDED' } as const;
    expect(isCompanyPageVisible('yarnwarehouse', profile)).toBe(true);
    expect(isCompanyPageVisible('yarnmachine', profile)).toBe(false);
    expect(isCompanyPageVisible('yarnhr', profile)).toBe(false);
  });
  it.each(BUSINESS_MODES)('keeps settings and help reachable for %s', businessMode => {
    for (const page of ['settings', 'tutorial', 'workspace', 'users']) {
      expect(isCompanyPageVisible(page, { businessMode, workspaceMode: 'GUIDED' })).toBe(true);
    }
    expect(isCompanyPageVisible('command-center', { businessMode, workspaceMode: 'FULL' })).toBe(true);
  });
});
