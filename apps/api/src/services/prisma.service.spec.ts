import { BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

describe('PrismaService startup reconciliation', () => {
  let service: PrismaService;
  let errors: jest.SpyInstance;

  beforeEach(() => {
    process.env.DATABASE_URL ||= 'file:./startup-spec-not-opened.db';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service = new PrismaService();
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('starts cleanly when the ledgers reconcile', async () => {
    jest.spyOn(service, '$transaction').mockResolvedValue(undefined as never);
    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(service.getStartupIssue()).toBeNull();
  });

  it('still starts when one business record breaks a ledger rule, and remembers why', async () => {
    jest.spyOn(service, '$transaction').mockRejectedValue(new BadRequestException('Cost entry #12 (Expense) has an invalid amount.') as never);
    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(service.getStartupIssue()).toBe('Cost entry #12 (Expense) has an invalid amount.');
    expect(errors).toHaveBeenCalledWith(expect.stringContaining('Cost entry #12'));
  });

  it('refuses to start on schema or connectivity failures', async () => {
    jest.spyOn(service, '$transaction').mockRejectedValue(new Error('no such column: main.SystemSettings.plan') as never);
    await expect(service.onModuleInit()).rejects.toThrow('no such column');
    expect(service.getStartupIssue()).toBeNull();
  });
});
