jest.mock('../../utils/user-audit',()=>({appendUserAudit:(tx:any,args:any)=>tx.activityLog.create(args)}));
import { NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
jest.mock('./auth.service', () => ({ AuthService: class {} }));
jest.mock('./webauthn.service', () => ({ WebAuthnService: class {} }));

describe('Own passkey management', () => {
  const tx = { webAuthnCredential: { findMany: jest.fn(), deleteMany: jest.fn() }, activityLog: { create: jest.fn() } };
  const prisma = { ...tx, $transaction: jest.fn(async (callback: any) => callback(tx)) };
  const auth = { assertOwnerProof: jest.fn() };
  const proof = { currentPassword: 'current-password', code: '123456' };
  const controller = new AuthController(auth as any, {} as any, prisma as any);
  const req = { user: { userId: 9, username: 'staff' } };
  beforeEach(() => { jest.clearAllMocks(); tx.webAuthnCredential.deleteMany.mockResolvedValue({ count: 1 }); tx.activityLog.create.mockResolvedValue({}); });
  it('only lists the authenticated user keys and excludes key material', async () => {
    await controller.listPasskeys(req);
    const args = tx.webAuthnCredential.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ userId: 9 });
    expect(args.select.publicKey).toBeUndefined();
  });
  it('scopes removal by credential and owner, and audits the removal', async () => {
    await controller.removePasskey('key-1', req, proof);
    expect(auth.assertOwnerProof).toHaveBeenCalledWith(9, proof.currentPassword, proof.code);
    expect(tx.webAuthnCredential.deleteMany).toHaveBeenCalledWith({ where: { id: 'key-1', userId: 9 } });
    expect(tx.activityLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ username: 'staff', action: 'REMOVE_PASSKEY' }) });
  });
  it('cannot remove another users passkey', async () => {
    tx.webAuthnCredential.deleteMany.mockResolvedValue({ count: 0 });
    await expect(controller.removePasskey('other-key', req, proof)).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.activityLog.create).not.toHaveBeenCalled();
  });
});
