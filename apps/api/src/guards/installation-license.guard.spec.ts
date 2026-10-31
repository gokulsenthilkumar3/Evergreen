import { ExecutionContext } from '@nestjs/common';
import { requireInstallationLicence } from '@evergreen/types/licensing';
import { InstallationLicenseGuard } from './installation-license.guard';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
jest.mock('@evergreen/types/licensing', () => ({
  requireInstallationLicence: jest.fn(),
}));
const context = (request: object) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  }) as unknown as ExecutionContext;
describe('Owner installation access', () => {
  beforeEach(() => jest.resetAllMocks());
  it('blocks staff, login and customer routes without a licence, including development mode', () => {
    jest.mocked(requireInstallationLicence).mockImplementation(() => {
      throw new Error('No licence');
    });
    for (const path of ['/users', '/auth/login', '/shop/items', '/health'])
      expect(() =>
        new InstallationLicenseGuard().canActivate(
          context({ method: 'GET', path }),
        ),
      ).toThrow('Installation authorization required');
  });
  it('allows only the minimal activation-status endpoint without a licence', () => {
    expect(
      new InstallationLicenseGuard().canActivate(
        context({ method: 'GET', path: '/license/status' }),
      ),
    ).toBe(true);
    expect(requireInstallationLicence).not.toHaveBeenCalled();
  });
  it('does not let a signed role scope grant more than the existing staff permission', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() =>
      guard.canActivate(
        context({
          method: 'GET',
          user: { role: 'ADMIN' },
          installationLicence: { roles: ['VIEWER'] },
        }),
      ),
    ).toThrow('not enabled');
    expect(() =>
      guard.canActivate(
        context({
          method: 'DELETE',
          user: { role: 'VIEWER' },
          installationLicence: { roles: ['VIEWER', 'ADMIN'] },
        }),
      ),
    ).toThrow('required role');
  });
});
