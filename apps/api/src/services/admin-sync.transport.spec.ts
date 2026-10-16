import { Logger } from '@nestjs/common';
import { AdminSyncService } from './admin-sync.service';
import type { PrismaService } from './prisma.service';

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
  expiresAt: null,
  gracePeriodDays: 7,
};

describe('AdminSyncService transport', () => {
  const prisma = {
    user: { count: jest.fn<Promise<number>, [unknown]>() },
    inwardBatch: { count: jest.fn<Promise<number>, []>() },
    outward: { count: jest.fn<Promise<number>, []>() },
    invoice: { count: jest.fn<Promise<number>, []>() },
    systemSettings: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: AdminSyncService;
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  let errorLog: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_ENV: 'test',
      ADMIN_API_URL: 'https://provider.example.test',
      COMPANY_ID: 'company-123',
      ADMIN_API_KEY: 'provider-operator-secret-must-never-be-sent',
    });
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorLog = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    fetchMock = jest.spyOn(globalThis, 'fetch');
    fetchMock.mockImplementation(() => Promise.resolve(Response.json(license)));
    prisma.user.count.mockResolvedValue(2);
    prisma.inwardBatch.count.mockResolvedValue(10);
    prisma.outward.count.mockResolvedValue(4);
    prisma.invoice.count.mockResolvedValue(7);
    prisma.systemSettings.findFirst.mockResolvedValue({ id: 1 });
    prisma.systemSettings.update.mockResolvedValue({});
    service = new AdminSyncService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const expectNoSync = () => {
    expect(fetchMock).not.toHaveBeenCalled();
    expect(prisma.user.count).not.toHaveBeenCalled();
    expect(prisma.inwardBatch.count).not.toHaveBeenCalled();
    expect(prisma.outward.count).not.toHaveBeenCalled();
    expect(prisma.invoice.count).not.toHaveBeenCalled();
    expect(prisma.systemSettings.findFirst).not.toHaveBeenCalled();
    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  };

  it.each([
    [undefined, undefined],
    ['', ''],
    ['   ', '   '],
    ['https://provider.example.test', undefined],
    [undefined, 'company-123'],
  ])(
    'does no work without both endpoint %s and identity %s',
    async (url, id) => {
      if (url === undefined) delete process.env.ADMIN_API_URL;
      else process.env.ADMIN_API_URL = url;
      if (id === undefined) delete process.env.COMPANY_ID;
      else process.env.COMPANY_ID = id;

      await service.syncMetrics();

      expectNoSync();
    },
  );

  it.each([
    'not a URL',
    'ftp://provider.example.test',
    'http://provider.example.test',
    'https://operator:secret@provider.example.test',
    'https://provider.example.test?key=secret',
    'https://provider.example.test#secret',
    'http://localhost.evil.test',
  ])('rejects unsafe endpoint %s before collecting metrics', async (url) => {
    process.env.ADMIN_API_URL = url;

    await service.syncMetrics();

    expectNoSync();
  });

  it.each([
    '../other',
    '.',
    '..',
    'other/company',
    'company?key=secret',
    'a'.repeat(129),
  ])('rejects invalid company identity %s', async (id) => {
    process.env.COMPANY_ID = id;

    await service.syncMetrics();

    expectNoSync();
  });

  it('uses the configured base path and real invoice count without forwarding the provider key', async () => {
    process.env.ADMIN_API_URL = ' https://provider.example.test/admin/v1/// ';
    process.env.COMPANY_ID = ' company-123 ';

    await service.syncMetrics();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://provider.example.test/admin/v1/companies/company-123/sync',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalInwards: 10,
          totalOutwards: 4,
          totalInvoices: 7,
          activeUsers: 2,
        }),
        redirect: 'error',
        signal: expect.any(AbortSignal) as unknown,
      },
    );
    expect(prisma.invoice.count).toHaveBeenCalledTimes(1);
    expect(prisma.systemSettings.update).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it.each(['localhost', '127.0.0.1', '[::1]'])(
    'allows loopback HTTP for development at %s',
    async (host) => {
      process.env.ADMIN_API_URL = `http://${host}:4300`;

      await service.syncMetrics();

      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        `http://${host}:4300/companies/company-123/sync`,
      );
      expect(prisma.systemSettings.update).toHaveBeenCalledTimes(1);
    },
  );

  it('requires HTTPS even for loopback in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_API_URL = 'http://localhost:4300';

    await service.syncMetrics();

    expectNoSync();
  });

  it('does not overlap runs and allows another run after completion', async () => {
    let complete!: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () => new Promise((resolve) => (complete = resolve)),
    );
    const pending = service.syncMetrics();
    await jest.advanceTimersByTimeAsync(0);

    await service.syncMetrics();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(prisma.invoice.count).toHaveBeenCalledTimes(1);
    complete(Response.json(license));
    await pending;
    await service.syncMetrics();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(prisma.systemSettings.update).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
  });

  it.each(['request', 'response body'])(
    'aborts a stalled %s after 10 seconds, preserves settings, and permits the next run',
    async (stage) => {
      let signal: AbortSignal | undefined;
      const untilAborted = () =>
        new Promise<never>((_resolve, reject) => {
          if (!signal) return reject(new Error('Missing request deadline'));
          signal.addEventListener('abort', () => reject(new Error('Aborted')), {
            once: true,
          });
        });
      fetchMock.mockImplementationOnce((_url, init) => {
        signal = init?.signal ?? undefined;
        if (stage === 'request') return untilAborted();
        const response = Response.json(license);
        jest.spyOn(response, 'json').mockImplementation(untilAborted);
        return Promise.resolve(response);
      });

      const pending = service.syncMetrics();
      await jest.advanceTimersByTimeAsync(9_999);
      expect(signal?.aborted).toBe(false);
      expect(prisma.systemSettings.update).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(1);
      await pending;

      expect(signal?.aborted).toBe(true);
      expect(prisma.systemSettings.update).not.toHaveBeenCalled();
      expect(errorLog).toHaveBeenCalledWith(
        expect.stringContaining('timed out'),
      );
      expect(jest.getTimerCount()).toBe(0);
      await service.syncMetrics();
      expect(prisma.systemSettings.update).toHaveBeenCalledTimes(1);
    },
  );

  it('does not log raw transport errors or response contents', async () => {
    fetchMock.mockRejectedValueOnce(
      new Error('secret-token / company-123 / private-provider-response'),
    );

    await service.syncMetrics();

    expect(errorLog).toHaveBeenCalled();
    expect(JSON.stringify(errorLog.mock.calls)).not.toMatch(
      /secret-token|company-123|private-provider-response/,
    );
    expect(errorLog.mock.calls[0]).toHaveLength(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('recovers after a local metric read fails without sending a partial snapshot', async () => {
    prisma.invoice.count.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );

    await service.syncMetrics();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(prisma.systemSettings.update).not.toHaveBeenCalled();
    await service.syncMetrics();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(prisma.systemSettings.update).toHaveBeenCalledTimes(1);
  });
});
