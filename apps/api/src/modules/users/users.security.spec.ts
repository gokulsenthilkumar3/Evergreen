jest.mock('../../utils/user-audit',()=>({appendUserAudit:(tx:any,args:any)=>tx.activityLog.create(args)}));
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('User security management', () => {
  const tx = { user: { findUnique: jest.fn() }, session: { updateMany: jest.fn() }, activityLog: { create: jest.fn(), findMany: jest.fn() } };
  const prisma = { ...tx, $transaction: jest.fn(async (callback: any) => callback(tx)) };
  const service = new UsersService(prisma as any);
  beforeEach(() => { jest.clearAllMocks(); tx.user.findUnique.mockResolvedValue({ id: 7, username: 'staff' }); tx.session.updateMany.mockResolvedValue({ count: 2 }); tx.activityLog.create.mockResolvedValue({}); tx.activityLog.findMany.mockResolvedValue([]); });
  it('revokes only the requested account sessions and records the reason inside the transaction', async () => {
    expect(await service.revokeAllSessions(7, 'owner', '  Account compromised  ')).toEqual({ revoked: 2 });
    expect(tx.session.updateMany).toHaveBeenCalledWith({ where: { userId: 7, isValid: true }, data: { isValid: false } });
    expect(tx.activityLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ username: 'owner', details: 'Revoked sessions for user 7: 2; reason: Account compromised' }) });
  });
  it('does not mutate sessions for an unknown account', async () => {
    tx.user.findUnique.mockResolvedValue(null);
    await expect(service.revokeAllSessions(8, 'owner', 'Offboarding')).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.session.updateMany).not.toHaveBeenCalled();
  });
  it('fails the mutation when the audit write fails', async () => {
    tx.activityLog.create.mockRejectedValueOnce(new Error('audit unavailable'));
    await expect(service.revokeAllSessions(7, 'owner', 'Offboarding')).rejects.toThrow('audit unavailable');
  });
  it('explicitly selects safe security metadata and limits history', async () => {
    await service.securityDetails(7);
    const selection = tx.user.findUnique.mock.calls[0][0].select;
    expect(selection.password).toBeUndefined();
    expect(selection.totpSecret).toBeUndefined();
    expect(selection.sessions.select.token).toBeUndefined();
    expect(selection.credentials.select.publicKey).toBeUndefined();
    expect(selection.sessions.take).toBe(100);
    expect(tx.activityLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 50 }));
  });
});
