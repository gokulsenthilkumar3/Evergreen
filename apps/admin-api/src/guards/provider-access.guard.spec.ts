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
    expect(req.providerActor).toBe('DevOps Lead');
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
});
