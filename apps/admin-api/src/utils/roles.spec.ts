import { normalizeRole } from './roles';

describe('normalizeRole', () => {
  it.each([
    ['viewer', 'VIEWER'],
    ['modifier', 'MODIFIER'],
    ['admin', 'ADMIN'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeRole(input)).toBe(expected);
  });

  it('fails closed to VIEWER for absent and unknown roles', () => {
    expect(normalizeRole(undefined)).toBe('VIEWER');
    expect(normalizeRole('SUPERUSER')).toBe('VIEWER');
    expect(normalizeRole('AUTHOR')).toBe('VIEWER');
  });
});
