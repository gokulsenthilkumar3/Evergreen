import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

jest.mock('./modules/auth/auth.service', () => ({ AuthService: class AuthService {} }));
jest.mock('./modules/auth/webauthn.service', () => ({
  WebAuthnService: class WebAuthnService {},
}));

import { AuthController } from './modules/auth/auth.controller';
import { CommerceController } from './modules/commerce/commerce.controller';
import { SessionsController } from './modules/sessions/sessions.controller';

describe('connected module smoke tests', () => {
  describe('Auth', () => {
    const auth = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };
    const controller = new AuthController(auth as any, {} as any, {} as any);
    const request = {
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      headers: { 'user-agent': 'Jest' },
    } as any;

    beforeEach(() => jest.clearAllMocks());

    it('keeps public staff signup disabled', async () => {
      await expect(controller.signup()).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('rejects malformed credentials without querying users', async () => {
      await expect(
        controller.login({ username: 'admin' }, request),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(auth.validateUser).not.toHaveBeenCalled();
    });

    it('delegates a valid password login with request metadata', async () => {
      const user = { id: 1, username: 'admin' };
      auth.validateUser.mockResolvedValue(user);
      auth.login.mockResolvedValue({ access_token: 'token' });
      await expect(
        controller.login({ username: 'admin', password: 'password' }, request),
      ).resolves.toEqual({ access_token: 'token' });
      expect(auth.login).toHaveBeenCalledWith(
        user,
        { ip: '127.0.0.1', userAgent: 'Jest' },
        undefined,
      );
    });
  });

  describe('Catalogue and invoices', () => {
    const commerce = {
      listItems: jest.fn(),
      createItem: jest.fn(),
      listInvoices: jest.fn(),
      createInvoice: jest.fn(),
    };
    const controller = new CommerceController(commerce as any);

    beforeEach(() => jest.clearAllMocks());

    it('connects catalogue reads and writes to the commerce owner', async () => {
      commerce.listItems.mockResolvedValue([{ id: 1 }]);
      commerce.createItem.mockResolvedValue({ id: 2 });
      await expect(controller.listItems()).resolves.toEqual([{ id: 1 }]);
      await expect(controller.createItem({ sku: 'Y-2' })).resolves.toEqual({
        id: 2,
      });
      expect(commerce.createItem).toHaveBeenCalledWith({ sku: 'Y-2' });
    });

    it('connects invoice reads and writes to the commerce owner', async () => {
      commerce.listInvoices.mockResolvedValue([{ id: 3 }]);
      commerce.createInvoice.mockResolvedValue({ id: 4 });
      await expect(controller.invoices()).resolves.toEqual([{ id: 3 }]);
      await expect(controller.invoice({ customerId: 1 })).resolves.toEqual({
        id: 4,
      });
      expect(commerce.createInvoice).toHaveBeenCalledWith({ customerId: 1 });
    });
  });

  describe('Sessions', () => {
    const sessions = {
      findSessionsForUser: jest.fn(),
      revokeSession: jest.fn(),
    };
    const controller = new SessionsController(sessions as any);
    const request = { user: { userId: 7, role: 'VIEWER' } } as any;

    beforeEach(() => jest.clearAllMocks());

    it('scopes listing and revocation through the authenticated user', async () => {
      sessions.findSessionsForUser.mockResolvedValue([{ id: 'own' }]);
      sessions.revokeSession.mockResolvedValue({ id: 'own', isValid: false });
      await expect(controller.getSessions(request)).resolves.toEqual([
        { id: 'own' },
      ]);
      await expect(controller.revokeSession('own', request)).resolves.toEqual({
        id: 'own',
        isValid: false,
      });
      expect(sessions.findSessionsForUser).toHaveBeenCalledWith(request.user);
      expect(sessions.revokeSession).toHaveBeenCalledWith('own', request.user);
    });
  });
});
