jest.mock('../../utils/user-audit',()=>({appendUserAudit:(tx:any,args:any)=>tx.activityLog.create(args)}));
import { BadRequestException } from '@nestjs/common';
import { createHash } from 'node:crypto';
const verify = jest.fn();
jest.mock('otplib', () => ({ TOTP: jest.fn().mockImplementation(() => ({ verify: (...args: unknown[]) => verify(...args), generateSecret: () => 'secret' })), generateURI: () => 'otpauth://test' }));
jest.mock('./passwords', () => ({ hashPassword: async () => 'argon-hash', verifyPassword: async () => true }));
import { AccountFlowsService } from './account-flows.service';

describe('Account action tokens', () => {
  const user = { id: 1, username: 'staff', email: 'staff@example.com', status: 'ACTIVE', isTotpEnabled: true, totpSecret: 'secret' };
  const token = { id: 'token-1', userId: 1, user, email: user.email, purpose: 'RESET_PASSWORD', usedAt: null, revokedAt: null, expiresAt: new Date(Date.now()+900000), deliveryStatus: 'ACCEPTED' };
  const tx = { accountActionToken: { findUnique: jest.fn(), updateMany: jest.fn(), update: jest.fn(), findMany: jest.fn() }, user: { findUnique: jest.fn(), update: jest.fn() }, userRecoveryCode: { findUnique: jest.fn(), updateMany: jest.fn() }, session: { updateMany: jest.fn() }, activityLog: { create: jest.fn() } };
  const prisma = { ...tx, $transaction: jest.fn(async (callback: any) => callback(tx)) };
  const mail = { readiness: jest.fn(() => []), sendAccountMessage: jest.fn() };
  const service = new AccountFlowsService(prisma as any, mail as any, { get: () => undefined } as any);
  beforeEach(() => { jest.clearAllMocks(); tx.accountActionToken.findUnique.mockResolvedValue({ ...token }); tx.accountActionToken.updateMany.mockResolvedValue({ count: 1 }); tx.user.findUnique.mockResolvedValue(user); tx.userRecoveryCode.updateMany.mockResolvedValue({ count: 1 }); verify.mockResolvedValue({ valid: true }); });
  it('rejects expired or previously consumed tokens without changing the account', async () => {
    tx.accountActionToken.findUnique.mockResolvedValue({ ...token, expiresAt: new Date(0) });
    await expect(service.redeem({token:'abc',password:'long-password'})).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.user.update).not.toHaveBeenCalled();
    tx.accountActionToken.findUnique.mockResolvedValue({ ...token, usedAt: new Date() });
    await expect(service.redeem({token:'abc',password:'long-password'})).rejects.toBeInstanceOf(BadRequestException);
  });
  it('requires MFA even with possession of a valid emailed recovery token', async () => {
    verify.mockResolvedValue({ valid: false });
    await expect(service.redeem({token:'abc',password:'long-password',code:'000000'})).rejects.toThrow('authenticator');
    expect(tx.user.update).not.toHaveBeenCalled();
  });
  it('consumes the token atomically, retires sibling links and revokes sessions', async () => {
    await service.redeem({token:'abc',password:'long-password',code:'123456'});
    expect(tx.accountActionToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 'token-1', usedAt: null, revokedAt: null }) }));
    expect(tx.session.updateMany).toHaveBeenCalledWith({where:{userId:1,isValid:true},data:{isValid:false}});
    expect(tx.user.update).toHaveBeenCalledWith({where:{id:1},data:expect.objectContaining({password:'argon-hash',failedLogins:0,lockedUntil:null})});
    expect(tx.activityLog.create).toHaveBeenCalled();
  });
  it('rejects concurrent reuse when the token claim loses the race', async () => {
    tx.accountActionToken.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.redeem({token:'abc',password:'long-password',code:'123456'})).rejects.toThrow('already used');
    expect(tx.user.update).not.toHaveBeenCalled();
  });
  it('cannot use a recovery code from another account', async () => {
    verify.mockResolvedValue({ valid: false }); tx.userRecoveryCode.findUnique.mockResolvedValue({id:'backup',userId:9,usedAt:null});
    await expect(service.redeem({token:'abc',password:'long-password',recoveryCode:'ABCD-EFGH'})).rejects.toThrow('authenticator');
    expect(tx.userRecoveryCode.findUnique).toHaveBeenCalledWith({where:{codeHash:createHash('sha256').update('ABCDEFGH').digest('hex')}});
  });
  it('does not reveal whether a public password-recovery email exists', async () => {
    tx.user.findUnique.mockResolvedValueOnce(null);
    const unknown = await service.requestReset('missing@example.com');
    tx.user.findUnique.mockResolvedValueOnce(user);
    expect(await service.requestReset(user.email)).toEqual(unknown);
  });
});
