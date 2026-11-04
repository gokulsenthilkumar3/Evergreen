jest.mock('../../utils/user-audit',()=>({appendUserAudit:(tx:any,args:any)=>tx.activityLog.create(args)}));
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
describe('Account lifecycle', () => {
  const tx = { user: { findUnique: jest.fn(), count: jest.fn(), update: jest.fn() }, session: { updateMany: jest.fn() }, systemSettings: { findFirst: jest.fn() }, activityLog: { create: jest.fn() } };
  const service = new UsersService({ $transaction: async (callback: any) => callback(tx) } as any);
  beforeEach(() => { jest.resetAllMocks(); tx.user.findUnique.mockResolvedValue({ id: 7, username: 'staff', status: 'ACTIVE', role: 'VIEWER' }); tx.user.count.mockResolvedValue(1); tx.systemSettings.findFirst.mockResolvedValue({ maxUsers: 10 }); tx.user.update.mockResolvedValue({ id: 7, status: 'SUSPENDED' }); });
  it('deactivates and revokes sessions within the audited transaction', async () => {
    await service.changeStatus(7, 'SUSPENDED', 'Investigating incident', 1, 'owner');
    expect(tx.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'SUSPENDED', currentChallenge: null }) }));
    expect(tx.session.updateMany).toHaveBeenCalledWith({ where: { userId: 7, isValid: true }, data: { isValid: false } });
    expect(tx.activityLog.create).toHaveBeenCalled();
  });
  it('preserves the account on deletion and records its deletion time', async () => {
    await service.deleteUser(7, 1, 'owner');
    expect(tx.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'DELETED', deletedAt: expect.any(Date) }) }));
  });
  it('prevents self deactivation and removal of the last active admin', async () => {
    await expect(service.changeStatus(1,'DISABLED','Offboarding',1,'owner')).rejects.toBeInstanceOf(BadRequestException);
    tx.user.findUnique.mockResolvedValue({ id: 7, role: 'ADMIN', status: 'ACTIVE' });
    await expect(service.changeStatus(7,'DELETED','Offboarding',1,'owner')).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.user.update).not.toHaveBeenCalled();
  });
  it('enforces the quota when restoring a deleted account', async () => {
    tx.user.findUnique.mockResolvedValue({ id: 7, role: 'VIEWER', status: 'DELETED' });
    tx.systemSettings.findFirst.mockResolvedValue({ maxUsers: 1 });
    await expect(service.changeStatus(7,'ACTIVE','Rehired staff',1,'owner')).rejects.toThrow('quota');
    expect(tx.user.update).not.toHaveBeenCalled();
  });
  it('does not allow skipping back to pending or using a blank reason', async () => {
    await expect(service.changeStatus(7,'PENDING','New onboarding',1,'owner')).rejects.toThrow('transition');
    await expect(service.changeStatus(7,'DISABLED','     ',1,'owner')).rejects.toBeInstanceOf(BadRequestException);
  });
});
