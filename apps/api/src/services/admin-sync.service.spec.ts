import { Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AdminSyncService } from './admin-sync.service';
import type { PrismaService } from './prisma.service';

const NOW = new Date('2026-10-15T12:00:00.000Z');
const FUTURE_EXPIRY = '2026-11-01T12:00:00.000Z';
const EXPIRED = '2026-10-10T12:00:00.000Z';

const license = {
  success: true,
  plan: 'GROWTH',
  pricingModel: 'TIERED',
  status: 'ACTIVE',
  tier: 'TIER_2_CITY',
  maxUsers: 3,
  maxMachines: 5,
  maxDocsPerMonth: 500,
  allowedModules: 'CORE,INVENTORY,COMMERCE',
  isMaintenance: false,
  expiresAt: FUTURE_EXPIRY,
  gracePeriodDays: 7,
};

const settings = {
  id: 1,
  plan: 'SEED',
  pricingModel: 'TIERED',
  status: 'SUSPENDED',
  tier: 'RURAL',
  maxUsers: 1,
  maxMachines: 2,
  maxDocsPerMonth: 100,
  allowedModules: 'CORE',
  isMaintenance: true,
  licenseExpiresAt: new Date(EXPIRED),
  gracePeriodDays: 2,
  graceExpiresAt: new Date('2026-10-12T12:00:00.000Z'),
};

describe('AdminSyncService licensing', () => {
  const prisma = {
    user: { count: jest.fn<Promise<number>, [unknown]>() },
    inwardBatch: { count: jest.fn<Promise<number>, []>() },
    outward: { count: jest.fn<Promise<number>, []>() },
    systemSettings: {
      findFirst: jest.fn<Promise<typeof settings | null>, []>(),
      update: jest.fn<Promise<unknown>, [Prisma.SystemSettingsUpdateArgs]>(),
    },
  };
  let service: AdminSyncService;
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  let errorLog: jest.SpyInstance;

  const respond = (payload: unknown) => {
    fetchMock.mockResolvedValue(Response.json(payload));
  };

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    jest.resetAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorLog = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    fetchMock = jest.spyOn(globalThis, 'fetch');
    respond(license);
    prisma.user.count.mockResolvedValue(2);
    prisma.inwardBatch.count.mockResolvedValue(10);
    prisma.outward.count.mockResolvedValue(4);
    prisma.systemSettings.findFirst.mockResolvedValue({ ...settings });
    prisma.systemSettings.update.mockResolvedValue({});
    service = new AdminSyncService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it.each([FUTURE_EXPIRY, EXPIRED, '2026-09-01T12:00:00.000Z', null])(
    'preserves provider suspension with expiry %s',
    async (expiresAt) => {
      prisma.systemSettings.findFirst.mockResolvedValue({
        ...settings,
        status: 'ACTIVE',
      });
      respond({ ...license, status: 'SUSPENDED', expiresAt });

      await service.syncMetrics();

      expect(prisma.systemSettings.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'SUSPENDED' }) as unknown,
      });
    },
  );

  it('reactivates a locally expired license only with a valid active provider response', async () => {
    await service.syncMetrics();

    expect(prisma.systemSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        plan: license.plan,
        pricingModel: license.pricingModel,
        status: 'ACTIVE',
        licenseExpiresAt: new Date(FUTURE_EXPIRY),
        gracePeriodDays: 7,
        graceExpiresAt: new Date('2026-11-08T12:00:00.000Z'),
        maxUsers: 3,
        maxMachines: 5,
        maxDocsPerMonth: 500,
        allowedModules: license.allowedModules,
        tier: license.tier,
        isMaintenance: false,
      },
    });
  });

  it.each([
    ['ACTIVE', FUTURE_EXPIRY, 7, 'ACTIVE'],
    ['ACTIVE', NOW.toISOString(), 7, 'ACTIVE'],
    ['ACTIVE', EXPIRED, 7, 'GRACE_PERIOD'],
    ['ACTIVE', '2026-10-08T12:00:00.000Z', 7, 'GRACE_PERIOD'],
    ['ACTIVE', '2026-10-08T11:59:59.999Z', 7, 'SUSPENDED'],
    ['ACTIVE', '2026-10-15T11:59:59.999Z', 0, 'SUSPENDED'],
    ['GRACE_PERIOD', FUTURE_EXPIRY, 7, 'ACTIVE'],
    ['GRACE_PERIOD', EXPIRED, 7, 'GRACE_PERIOD'],
    ['GRACE_PERIOD', '2026-09-01T12:00:00.000Z', 7, 'SUSPENDED'],
  ])(
    'derives %s with expiry %s and %d grace days as %s',
    async (providerStatus, expiresAt, gracePeriodDays, expectedStatus) => {
      respond({
        ...license,
        status: providerStatus,
        expiresAt,
        gracePeriodDays,
      });

      await service.syncMetrics();

      expect(prisma.systemSettings.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: expectedStatus,
          gracePeriodDays,
        }) as unknown,
      });
    },
  );

  it('clears expiry and grace dates when the provider removes the expiry', async () => {
    respond({ ...license, expiresAt: null });

    await service.syncMetrics();

    expect(prisma.systemSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        status: 'ACTIVE',
        licenseExpiresAt: null,
        graceExpiresAt: null,
      }) as unknown,
    });
  });

  it('preserves valid zero quotas and applies only allowlisted license fields', async () => {
    respond({
      ...license,
      maxMachines: 0,
      maxDocsPerMonth: 0,
      isMaintenance: false,
      id: 999,
      updatedBy: 'forged actor',
      lastMigrationStatus: 'SUCCESS',
    });

    await service.syncMetrics();

    const update = prisma.systemSettings.update.mock.calls[0]?.[0];
    expect(update?.where).toEqual({ id: 1 });
    expect(update?.data).toMatchObject({
      maxMachines: 0,
      maxDocsPerMonth: 0,
      isMaintenance: false,
    });
    expect(update?.data).not.toHaveProperty('id');
    expect(update?.data).not.toHaveProperty('updatedBy');
    expect(update?.data).not.toHaveProperty('lastMigrationStatus');
  });

  it.each([
    ['unsuccessful response', { ...license, success: false }],
    ['missing success flag', { ...license, success: undefined }],
    ['missing status', { ...license, status: undefined }],
    ['unknown status', { ...license, status: 'ENABLED' }],
    ['null status', { ...license, status: null }],
    ['unknown plan', { ...license, plan: 'FREE' }],
    ['unknown pricing model', { ...license, pricingModel: 'FREE' }],
    ['unknown tier', { ...license, tier: 'UNKNOWN' }],
    ['unknown module', { ...license, allowedModules: 'CORE,ROOT' }],
    ['empty modules', { ...license, allowedModules: '' }],
    ['invalid date', { ...license, expiresAt: 'not-a-date' }],
    ['impossible calendar date', { ...license, expiresAt: '2026-02-30' }],
    ['missing expiry', { ...license, expiresAt: undefined }],
    ['negative grace', { ...license, gracePeriodDays: -1 }],
    ['fractional grace', { ...license, gracePeriodDays: 0.5 }],
    ['excessive grace', { ...license, gracePeriodDays: 366 }],
    ['null grace', { ...license, gracePeriodDays: null }],
    ['zero users', { ...license, maxUsers: 0 }],
    ['negative quota', { ...license, maxMachines: -1 }],
    ['string quota', { ...license, maxUsers: '10' }],
    ['fractional quota', { ...license, maxDocsPerMonth: 0.5 }],
    ['overflow quota', { ...license, maxDocsPerMonth: 2_147_483_648 }],
    ['null quota', { ...license, maxMachines: null }],
    ['string maintenance flag', { ...license, isMaintenance: 'false' }],
    [
      'missing quotas',
      { success: true, status: 'ACTIVE', expiresAt: FUTURE_EXPIRY },
    ],
    ['null body', null],
    ['array body', [license]],
    ['string body', 'ACTIVE'],
  ])('retains local settings for %s', async (_description, payload) => {
    respond(payload);

    await expect(service.syncMetrics()).resolves.toBeUndefined();

    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalled();
  });

  it.each([401, 503])(
    'retains local settings after HTTP %d',
    async (status) => {
      fetchMock.mockResolvedValue(new Response('Provider error', { status }));

      await expect(service.syncMetrics()).resolves.toBeUndefined();

      expect(prisma.systemSettings.update).not.toHaveBeenCalled();
      expect(errorLog).toHaveBeenCalled();
    },
  );

  it('retains local settings on a network failure', async () => {
    fetchMock.mockRejectedValue(new Error('Connection lost'));

    await expect(service.syncMetrics()).resolves.toBeUndefined();

    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalled();
  });

  it('retains local settings for malformed JSON', async () => {
    fetchMock.mockResolvedValue(new Response('{broken json'));

    await expect(service.syncMetrics()).resolves.toBeUndefined();

    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalled();
  });

  it('does not create settings when the installation is not initialized', async () => {
    prisma.systemSettings.findFirst.mockResolvedValue(null);

    await service.syncMetrics();

    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
  });
});
