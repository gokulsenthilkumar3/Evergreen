import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../services/prisma.service';

describe('Provider remote actions', () => {
  const transaction = {
    company: { findUnique: jest.fn(), update: jest.fn() },
    remoteAction: { create: jest.fn() },
  };
  const prisma = { $transaction: jest.fn() };
  let service: CompaniesService;

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(
      (work: (tx: typeof transaction) => Promise<unknown>) => work(transaction),
    );
    transaction.company.findUnique.mockResolvedValue({
      id: 'company-1',
      isMaintenance: false,
    });
    transaction.company.update.mockResolvedValue({});
    transaction.remoteAction.create.mockImplementation(({ data }) =>
      Promise.resolve(data),
    );
    service = new CompaniesService(prisma as unknown as PrismaService);
  });

  it.each([
    'TRIGGER_MIGRATION',
    'FORCE_SYNC',
    'REFRESH_LICENSE',
    'SYNC_TALLY',
    'RESTART_SERVICE',
  ])(
    'does not claim execution or queue a %s request without a worker',
    async (action) => {
      await expect(
        service.executeRemoteAction('company-1', action),
      ).rejects.toThrow(ServiceUnavailableException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(transaction.remoteAction.create).not.toHaveBeenCalled();
    },
  );

  it('rejects unknown actions without writes', async () => {
    await expect(
      service.executeRemoteAction('company-1', 'ARBITRARY_COMMAND'),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects invalid details without writes', async () => {
    await expect(
      service.executeRemoteAction(
        'company-1',
        'TOGGLE_MAINTENANCE',
        'x'.repeat(1001),
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'saves the maintenance preference and its record together from %s',
    async (isMaintenance) => {
      transaction.company.findUnique.mockResolvedValue({
        id: 'company-1',
        isMaintenance,
      });
      const result = await service.executeRemoteAction(
        'company-1',
        'TOGGLE_MAINTENANCE',
      );
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(transaction.company.update).toHaveBeenCalledWith({
        where: { id: 'company-1' },
        data: { isMaintenance: !isMaintenance },
      });
      expect(result.details).toContain('tenant application is unconfirmed');
    },
  );

  it('rejects missing companies without creating a record', async () => {
    transaction.company.findUnique.mockResolvedValue(null);
    await expect(
      service.executeRemoteAction('missing', 'TOGGLE_MAINTENANCE'),
    ).rejects.toThrow(NotFoundException);
    expect(transaction.remoteAction.create).not.toHaveBeenCalled();
  });

  it('propagates a failed preference update without recording success', async () => {
    transaction.company.update.mockRejectedValue(new Error('write failed'));
    await expect(
      service.executeRemoteAction('company-1', 'TOGGLE_MAINTENANCE'),
    ).rejects.toThrow('write failed');
    expect(transaction.remoteAction.create).not.toHaveBeenCalled();
  });
});
