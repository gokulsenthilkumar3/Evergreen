import { omit } from './omit';

describe('omit', () => {
  it('copies every other own property and leaves the source untouched', () => {
    const source = { id: 1, password: 'hash', username: 'owner', role: null };
    const result = omit(source, ['id', 'password']);
    expect(result).toEqual({ username: 'owner', role: null });
    expect(source).toEqual({
      id: 1,
      password: 'hash',
      username: 'owner',
      role: null,
    });
  });

  it('keeps Date values as the same instances', () => {
    const date = new Date('2026-10-16T00:00:00Z');
    expect(omit({ id: 1, date }, ['id']).date).toBe(date);
  });
});
