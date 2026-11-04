import { describe, expect, it } from 'vitest';
import {
  canonicalIndianState,
  gstinStateName,
  isValidGstin,
  isValidPhone,
  previewImport,
  validatePartyContact,
} from '@evergreen/types';

describe('GST identity rules', () => {
  it('accepts a well-formed GSTIN in any case and rejects others', () => {
    expect(isValidGstin(' 33abcde1234f1z5 ')).toBe(true);
    for (const value of ['', 'NOT-A-GSTIN', '33ABCDE1234F1Y5', '33ABCDE1234F0Z5', '3ABCDE1234F1Z5']) expect(isValidGstin(value)).toBe(false);
  });

  it('reads the registered state from the first two digits', () => {
    expect(gstinStateName('33ABCDE1234F1Z5')).toBe('Tamil Nadu');
    expect(gstinStateName('32ABCDE1234F1Z5')).toBe('Kerala');
    expect(gstinStateName('37ABCDE1234F1Z5')).toBe('Andhra Pradesh');
    expect(gstinStateName('97ABCDE1234F1Z5')).toBeNull();
    expect(gstinStateName('bad')).toBeNull();
  });

  it('matches state names without regard to case or surrounding spaces', () => {
    expect(canonicalIndianState('  tamil nadu ')).toBe('Tamil Nadu');
    expect(canonicalIndianState('TN')).toBeNull();
  });

  it('checks phone digit counts', () => {
    expect(isValidPhone('+91 98765 43210')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('98765abc43')).toBe(false);
  });

  it('fills the state from the GSTIN and rejects a disagreeing state', () => {
    expect(validatePartyContact({ gstin: '32abcde1234f1z5' })).toEqual({ value: { gstin: '32ABCDE1234F1Z5', state: 'Kerala' } });
    expect(validatePartyContact({ gstin: '32ABCDE1234F1Z5', state: 'Tamil Nadu' }).error).toMatch(/registered in Kerala/);
    expect(validatePartyContact({ gstin: '32ABCDE1234F1Z5' }, { currentState: 'Goa' }).error).toMatch(/not Goa/);
  });

  it('only returns supplied fields and clears blank ones', () => {
    expect(validatePartyContact({ email: '', phone: undefined })).toEqual({ value: { email: null } });
  });
});

describe('customer import tax fields', () => {
  const preview = (row: string[]) => previewImport({ entity: 'customers', headers: ['Name', 'GSTIN', 'State'], rows: [row], mapping: { name: 0, gstin: 1, state: 2 } });

  it('normalizes the state spelling', () => {
    expect(preview(['A', '', 'kerala']).records[0].state).toBe('Kerala');
  });

  it('reports a GSTIN registered in another state', () => {
    expect(preview(['A', '33ABCDE1234F1Z5', 'Kerala']).issues).toEqual([{ row: 2, field: 'state', message: 'The GSTIN is registered in Tamil Nadu.' }]);
  });

  it('reports a state that is not Indian', () => {
    expect(preview(['A', '', 'Atlantis']).issues[0]).toMatchObject({ field: 'state' });
  });

  it('takes the state from the GSTIN when the column is blank', () => {
    expect(preview(['A', '32ABCDE1234F1Z5', '']).records[0].state).toBe('Kerala');
  });
});
