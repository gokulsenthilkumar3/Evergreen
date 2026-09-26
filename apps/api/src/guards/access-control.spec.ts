import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { LegacyBillingReadOnlyGuard } from './legacy-billing-read-only.guard';
import { PublicOrderRateLimitGuard } from './public-order-rate-limit.guard';
import { requireJwtSecret } from '../modules/auth/jwt-secret';

const context = (method: string, role?: string, ip = '127.0.0.1') => ({
  getHandler: () => () => undefined,
  getClass: () => class TestController {},
  switchToHttp: () => ({ getRequest: () => ({ method, user: role ? { role } : undefined, ip }) }),
}) as unknown as ExecutionContext;

describe('API access boundaries', () => {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;

  beforeEach(() => jest.clearAllMocks());

  it('denies anonymous staff reads and viewer mutations', () => {
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(context('GET'))).toThrow();
    expect(guard.canActivate(context('GET', 'VIEWER'))).toBe(true);
    expect(() => guard.canActivate(context('POST', 'VIEWER'))).toThrow();
    expect(guard.canActivate(context('POST', 'MODIFIER'))).toBe(true);
    expect(() => guard.canActivate(context('DELETE', 'MODIFIER'))).toThrow();
    expect(guard.canActivate(context('DELETE', 'AUTHOR'))).toBe(true);
  });

  it('keeps legacy billing records readable while refusing every old write path', () => {
    const guard = new LegacyBillingReadOnlyGuard();
    expect(guard.canActivate(context('GET', 'VIEWER'))).toBe(true);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(() => guard.canActivate(context(method, 'ADMIN'))).toThrow();
    }
  });

  it('throttles public order submissions per IP', () => {
    const guard = new PublicOrderRateLimitGuard();
    for (let i = 0; i < 10; i++) expect(guard.canActivate(context('POST', undefined, '1.2.3.4'))).toBe(true);
    expect(() => guard.canActivate(context('POST', undefined, '1.2.3.4'))).toThrow();
    expect(guard.canActivate(context('POST', undefined, '5.6.7.8'))).toBe(true);
  });

  it('refuses an absent or short token-signing secret', () => {
    expect(() => requireJwtSecret({ get: () => undefined } as any)).toThrow();
    expect(() => requireJwtSecret({ get: () => 'short' } as any)).toThrow();
    expect(requireJwtSecret({ get: () => 'x'.repeat(32) } as any)).toHaveLength(32);
  });
});
