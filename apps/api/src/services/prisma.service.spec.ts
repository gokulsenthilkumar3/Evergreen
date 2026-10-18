import { BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

describe('PrismaService reconciliation state', () => {
  let service: PrismaService;
  let errors: jest.SpyInstance;
  let transaction: jest.SpyInstance;
  const badRecord = new BadRequestException(
    'Not enough released company-owned lot stock.',
  );

  beforeEach(() => {
    process.env.DATABASE_URL ||= 'file:./startup-spec-not-opened.db';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service = new PrismaService();
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    transaction = jest.spyOn(service, '$transaction');
  });
  afterEach(() => jest.restoreAllMocks());

  it('starts cleanly when the ledgers reconcile', async () => {
    transaction.mockResolvedValue([] as never);
    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(service.getStartupIssue()).toBeNull();
    expect(service.getDataIssues()).toEqual([]);
  });

  it('starts and lists stored records that could not be posted', async () => {
    transaction.mockResolvedValue([
      'Cost entry #12 (Expense) has an invalid amount and is not posted.',
    ] as never);
    await service.onModuleInit();
    expect(service.getStartupIssue()).toBeNull();
    expect(service.getDataIssues()).toEqual([
      'Cost entry #12 (Expense) has an invalid amount and is not posted.',
    ]);
  });

  it('still starts when a business record blocks reconciliation, and remembers why', async () => {
    transaction.mockRejectedValue(badRecord as never);
    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(service.getStartupIssue()).toBe(
      'Not enough released company-owned lot stock.',
    );
    expect(errors).toHaveBeenCalledWith(
      expect.stringContaining('Not enough released'),
    );
  });

  it('refuses to start on schema or connectivity failures', async () => {
    transaction.mockRejectedValue(
      new Error('no such column: main.SystemSettings.plan') as never,
    );
    await expect(service.onModuleInit()).rejects.toThrow('no such column');
    expect(service.getStartupIssue()).toBeNull();
  });

  it('clears the startup issue when a later start reconciles', async () => {
    transaction
      .mockRejectedValueOnce(badRecord as never)
      .mockResolvedValue([] as never);
    await service.onModuleInit();
    expect(service.getStartupIssue()).not.toBeNull();
    await service.onModuleInit();
    expect(service.getStartupIssue()).toBeNull();
  });

  it('re-checks after a successful posting and clears a startup issue the posting repaired', async () => {
    transaction.mockRejectedValueOnce(badRecord as never);
    await service.onModuleInit();
    transaction
      .mockResolvedValueOnce('posted' as never)
      .mockResolvedValueOnce([] as never);

    await expect(
      service.stockTransaction(() => Promise.resolve('posted')),
    ).resolves.toBe('posted');

    expect(transaction).toHaveBeenCalledTimes(3);
    expect(service.getStartupIssue()).toBeNull();
  });

  it('keeps reporting the startup issue while the full check still fails, without failing the committed posting', async () => {
    transaction.mockRejectedValueOnce(badRecord as never);
    await service.onModuleInit();
    transaction
      .mockResolvedValueOnce('posted' as never)
      .mockRejectedValueOnce(
        new BadRequestException('Still short of lot stock.') as never,
      );

    await expect(
      service.stockTransaction(() => Promise.resolve('posted')),
    ).resolves.toBe('posted');
    expect(service.getStartupIssue()).toBe('Still short of lot stock.');

    transaction
      .mockResolvedValueOnce('posted' as never)
      .mockRejectedValueOnce(new Error('database is locked') as never);
    await expect(
      service.stockTransaction(() => Promise.resolve('posted')),
    ).resolves.toBe('posted');
    expect(service.getStartupIssue()).toBe('Still short of lot stock.');
  });

  it('does not re-run the full check on every posting when nothing is wrong', async () => {
    transaction.mockResolvedValue([] as never);
    await service.onModuleInit();
    await service.stockTransaction(() => Promise.resolve('posted'));
    expect(transaction).toHaveBeenCalledTimes(2);
  });

  it('does not touch the recorded state when a posting fails', async () => {
    transaction.mockResolvedValueOnce([
      'Cost entry #3 (Expense) has an invalid amount and is not posted.',
    ] as never);
    await service.onModuleInit();
    transaction.mockRejectedValueOnce(
      new BadRequestException('Books are closed') as never,
    );
    await expect(
      service.stockTransaction(() => Promise.resolve('posted')),
    ).rejects.toThrow('Books are closed');
    expect(service.getDataIssues()).toHaveLength(1);
  });
});
