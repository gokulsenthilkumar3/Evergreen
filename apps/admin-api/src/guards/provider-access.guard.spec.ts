import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ProviderAccessGuard } from './provider-access.guard';

describe('ProviderAccessGuard', () => {
  let guard: ProviderAccessGuard;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.ADMIN_API_KEY = 'test_secret_admin_key_32_bytes_len';
    delete process.env.NODE_ENV;
    guard = new ProviderAccessGuard();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createMockContext(req: Record<string, any>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
      getClass: () => ({}),
      getHandler: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => ({}),
      getType: () => 'http',
    } as unknown as ExecutionContext;
  }

  it('binds a company credential to its own POST sync routes', async () => {
    const apiKey = 'company-only-fixture-credential-32-characters';
    const company = { findUnique: jest.fn(async ({ where }) => where.id === 'company-1' ? { apiKey } : null) };
    const scoped = new ProviderAccessGuard({ company } as never);
    const req = { method: 'POST', path: '/companies/company-1/sync', headers: { 'x-company-key': apiKey } };
    await expect(scoped.canActivate(createMockContext(req))).resolves.toBe(true);
    await expect(scoped.canActivate(createMockContext({ ...req, path: '/companies/company-2/sync' }))).rejects.toThrow('Invalid company');
    expect(() => scoped.canActivate(createMockContext({ ...req, path: '/companies/company-1/license' }))).toThrow('not valid');
    expect(() => scoped.canActivate(createMockContext({ ...req, method: 'GET' }))).toThrow('not valid');
    await expect(scoped.canActivate(createMockContext({ ...req, headers: { 'x-company-key': 'wrong' } }))).rejects.toThrow('Invalid company');
  });

  it('allows public GET / and GET /health without auth', () => {
    const rootCtx = createMockContext({ method: 'GET', path: '/', headers: {} });
    const healthCtx = createMockContext({ method: 'GET', path: '/health', headers: {} });
    expect(guard.canActivate(rootCtx)).toBe(true);
    expect(guard.canActivate(healthCtx)).toBe(true);
  });

  it('rejects unauthenticated requests even if Host or Origin is localhost', () => {
    const ctx = createMockContext({
      method: 'GET',
      path: '/companies',
      headers: {
        host: 'localhost:4300',
        origin: 'http://localhost:5174',
      },
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('allows requests with valid Authorization Bearer token', () => {
    const req: Record<string, any> = {
      method: 'GET',
      path: '/companies',
      headers: {
        authorization: 'Bearer test_secret_admin_key_32_bytes_len',
        'x-provider-actor': 'DevOps Lead',
      },
    };
    const ctx = createMockContext(req);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.providerActor).toBe('Provider operator');
  });

  it('allows requests with valid x-provider-key header', () => {
    const req: Record<string, any> = {
      method: 'POST',
      path: '/companies/1/actions',
      headers: {
        'x-provider-key': 'test_secret_admin_key_32_bytes_len',
      },
    };
    const ctx = createMockContext(req);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.providerActor).toBe('Provider operator');
  });

  it('rejects requests with invalid credentials', () => {
    const ctx = createMockContext({
      method: 'GET',
      path: '/companies',
      headers: {
        authorization: 'Bearer wrong_token_value',
      },
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects default development key in production mode', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_API_KEY;
    const prodGuard = new ProviderAccessGuard();
    const ctx = createMockContext({
      method: 'GET',
      path: '/companies',
      headers: {
        authorization: 'Bearer evergreen_master_admin_dev_token_secret_key_32bytes',
      },
    });
    expect(() => prodGuard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects every credential when the server key is not configured', () => {
    delete process.env.ADMIN_API_KEY;
    const unconfigured = new ProviderAccessGuard();
    const ctx = createMockContext({
      method: 'GET',
      path: '/companies',
      headers: { authorization: 'Bearer any-token' },
    });
    expect(() => unconfigured.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it.each(['short', 'evergreen_master_admin_dev_token_secret_key_32bytes', 'provider_master_key_9921_secret'])(
    'rejects a weak or known default server key: %s', (key) => {
      process.env.ADMIN_API_KEY = key;
      expect(() => guard.canActivate(createMockContext({
        method: 'GET', path: '/companies', headers: { authorization: `Bearer ${key}` },
      }))).toThrow(UnauthorizedException);
    },
  );

  it('rejects an authorization value without the Bearer scheme', () => {
    expect(() => guard.canActivate(createMockContext({
      method: 'GET', path: '/companies', headers: { authorization: process.env.ADMIN_API_KEY },
    }))).toThrow(UnauthorizedException);
  });
});
