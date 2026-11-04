import {
  createProviderSession,
  PROVIDER_COOKIE,
  revokeProviderSession,
  validateProviderSession,
} from './provider-session';
import { ProviderAccessGuard } from './provider-access.guard';
import type { ExecutionContext } from '@nestjs/common';
const key = 'owner-test-key-that-is-at-least-32-characters';
const context = (request: object) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;
describe('Protected provider browser sessions', () => {
  const previous = process.env.ADMIN_API_KEY;
  beforeEach(() => {
    process.env.ADMIN_API_KEY = key;
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = previous;
  });
  it('accepts a random session without exposing the owner credential and revokes it', () => {
    const token = createProviderSession(key),
      cookie = `${PROVIDER_COOKIE}=${token}`;
    expect(token).not.toContain(key);
    expect(validateProviderSession(cookie, key)).toBe(true);
    revokeProviderSession(cookie);
    expect(validateProviderSession(cookie, key)).toBe(false);
  });
  it('rejects forged tokens, credential rotation and expiry', () => {
    const token = createProviderSession(key),
      cookie = `${PROVIDER_COOKIE}=${token}`;
    expect(
      validateProviderSession(`${PROVIDER_COOKIE}=${'a'.repeat(43)}`, key),
    ).toBe(false);
    expect(validateProviderSession(cookie, key + '-rotated')).toBe(false);
    const later = createProviderSession(key);
    const clock = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.now() + 9 * 3600000);
    try {
      expect(validateProviderSession(`${PROVIDER_COOKIE}=${later}`, key)).toBe(
        false,
      );
    } finally {
      clock.mockRestore();
    }
  });
  it('requires a trusted origin for browser mutations', () => {
    const cookie = `${PROVIDER_COOKIE}=${createProviderSession(key)}`;
    const guard = new ProviderAccessGuard();
    expect(
      guard.canActivate(
        context({
          method: 'POST',
          path: '/companies',
          headers: { cookie, origin: 'http://localhost:5174' },
        }),
      ),
    ).toBe(true);
    expect(() =>
      guard.canActivate(
        context({
          method: 'POST',
          path: '/companies',
          headers: { cookie, origin: 'http://localhost:4001' },
        }),
      ),
    ).toThrow('origin');
    expect(() =>
      guard.canActivate(
        context({ method: 'POST', path: '/companies', headers: { cookie } }),
      ),
    ).toThrow('origin');
  });
});
