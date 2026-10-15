import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { Server } from 'node:http';
import type { Company } from '@prisma/admin-client';
import request from 'supertest';
import { ProviderAccessGuard } from '../../guards/provider-access.guard';
import { PrismaService } from '../../services/prisma.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

// Real HTTP, provider authentication, runtime validation, migrations and SQLite.
// Every write, including deliberate rollback failures, targets this suite's new temporary DB.
describe('Provider company contracts', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService;
  let companyId: string;
  let enrollmentKey: string;
  const originalEnv = { ...process.env };
  const providerKey = randomBytes(32).toString('hex');
  const headers = () => ({ Authorization: `Bearer ${providerKey}` });
  const metrics = {
    totalInwards: 2,
    totalOutwards: 3,
    totalInvoices: 4,
    activeUsers: 1,
  };
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const root = resolve(__dirname, '../../../../..');
    const directory = mkdtempSync(
      join(tmpdir(), 'evergreen-provider-contract-'),
    );
    process.env.ADMIN_DATABASE_URL = `file:${join(directory, 'provider.db').replace(/\\/g, '/')}`;
    process.env.ADMIN_API_KEY = providerKey;
    process.env.ADMIN_API_ACTOR = 'Contract test operator';
    execFileSync(
      process.execPath,
      [
        join(root, 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema',
        join(root, 'packages/admin-database/prisma/schema.prisma'),
      ],
      { env: process.env, stdio: 'pipe' },
    );
    const module = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        CompaniesService,
        PrismaService,
        { provide: APP_GUARD, useClass: ProviderAccessGuard },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    const created = await http()
      .post('/companies')
      .set(headers())
      .send({
        name: '  Contract Mill  ',
        plan: 'GROWTH',
        tier: 'TIER_3_CITY',
        pricingModel: 'PER_SPINDLE',
        cloudProvider: 'LOCAL_VM',
        deploymentUrl: 'http://127.0.0.1:4000',
        maxUsers: 5,
      })
      .expect(201);
    const company = created.body as Company;
    expect(company.name).toBe('Contract Mill');
    expect(company.pricingModel).toBe('PER_SPINDLE');
    companyId = company.id;
    enrollmentKey = company.apiKey;
    expect(enrollmentKey).toMatch(/^[a-f0-9]{64}$/);
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    process.env = originalEnv;
  });

  it('rejects missing provider credentials and ignores a forged actor', async () => {
    await http().get('/companies').expect(401);
    await http()
      .post(`/companies/${companyId}/license`)
      .set(headers())
      .set('X-Provider-Actor', 'forged')
      .send({ status: 'ACTIVE', details: 'Reviewed payment' })
      .expect(201);
    const audit = await prisma.controlAudit.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    expect(audit?.actor).toBe('Contract test operator');
    const details: unknown = JSON.parse(audit!.details);
    expect(details).toMatchObject({ reason: 'Reviewed payment' });
  });

  it.each([
    {},
    { name: ' ' },
    { name: null },
    { name: 'x'.repeat(201) },
    { name: 'x', apiKey: 'injected' },
    { name: 'x', id: randomUUID() },
    { name: 'x', licenseKey: 'injected' },
    { name: 'x', activeStaff: 10 },
    { name: 'x', maxUsers: 0 },
    { name: 'x', maxUsers: '5' },
    { name: 'x', maxUsers: null },
    { name: 'x', maxMachines: -1 },
    { name: 'x', maxDocsPerMonth: 2 ** 31 },
    { name: 'x', pricingModel: 'UNKNOWN' },
    { name: 'x', cloudProvider: 'UNKNOWN' },
    { name: 'x', businessMode: 'UNKNOWN' },
    { name: 'x', country: 'India' },
    { name: 'x', deploymentUrl: 'javascript:alert(1)' },
    { name: 'x', deploymentUrl: 'https://user:password@example.test' },
    { name: 'x', allowedModules: 'CORE,UNKNOWN' },
    { name: 'x', plan: null },
  ])('rejects invalid creation before persistence: %j', async (body) => {
    const count = await prisma.company.count();
    await http().post('/companies').set(headers()).send(body).expect(400);
    expect(await prisma.company.count()).toBe(count);
  });

  it('does not return enrollment credentials from list, detail or license updates', async () => {
    const list = await http().get('/companies').set(headers()).expect(200);
    const detail = await http()
      .get(`/companies/${companyId}`)
      .set(headers())
      .expect(200);
    const update = await http()
      .post(`/companies/${companyId}/license`)
      .set(headers())
      .send({ maxUsers: 4 })
      .expect(201);
    for (const response of [list, detail, update]) {
      expect(response.text).not.toContain(enrollmentKey);
      expect(response.text).not.toContain('"apiKey"');
    }
  });

  it('accepts the real reactivation form, stores its reason and clears nullable dates', async () => {
    const expiresAt = '2027-10-15T00:00:00.000Z';
    await http()
      .post(`/companies/${companyId}/license`)
      .set(headers())
      .send({
        status: 'ACTIVE',
        expiresAt,
        graceExpiresAt: null,
        details: 'Payment verified via UTR: TEST-1',
      })
      .expect(201);
    const company = await prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });
    expect(company.expiresAt?.toISOString()).toBe(expiresAt);
    expect(company.graceExpiresAt).toBeNull();
    await http()
      .post(`/companies/${companyId}/license`)
      .set(headers())
      .send({ expiresAt: null })
      .expect(201);
    expect(
      (await prisma.company.findUniqueOrThrow({ where: { id: companyId } }))
        .expiresAt,
    ).toBeNull();
  });

  it.each([
    {},
    { details: 'No actual change' },
    { status: 'EXECUTED' },
    { status: null },
    { isMaintenance: 'false' },
    { isMaintenance: null },
    { expiresAt: '2026-02-30' },
    { expiresAt: 'tomorrow' },
    { maxUsers: 1.1 },
    { gracePeriodDays: -1 },
    { gracePeriodDays: 366 },
    { apiKey: 'forged' },
    { details: 'x'.repeat(1001), status: 'ACTIVE' },
  ])('rejects invalid license updates without writes: %j', async (body) => {
    const before = await prisma.company.findUnique({
      where: { id: companyId },
    });
    const auditCount = await prisma.controlAudit.count();
    await http()
      .post(`/companies/${companyId}/license`)
      .set(headers())
      .send(body)
      .expect(400);
    expect(
      await prisma.company.findUnique({ where: { id: companyId } }),
    ).toEqual(before);
    expect(await prisma.controlAudit.count()).toBe(auditCount);
  });

  it('rolls back a license change if audit persistence fails', async () => {
    const before = await prisma.company.findUnique({
      where: { id: companyId },
    });
    await prisma.$executeRawUnsafe(
      "CREATE TRIGGER reject_audit BEFORE INSERT ON ControlAudit BEGIN SELECT RAISE(ABORT, 'test failure'); END",
    );
    try {
      await http()
        .post(`/companies/${companyId}/license`)
        .set(headers())
        .send({ maxUsers: 99 })
        .expect(500);
      expect(
        await prisma.company.findUnique({ where: { id: companyId } }),
      ).toEqual(before);
    } finally {
      await prisma.$executeRawUnsafe('DROP TRIGGER reject_audit');
    }
  });

  it.each(['sync', 'v1/sync'])(
    'updates one daily record through %s and returns only license fields',
    async (route) => {
      const payload = { ...metrics, appVersion: '1.2.3' };
      for (let i = 0; i < 2; i++) {
        const result = await http()
          .post(`/companies/${companyId}/${route}`)
          .set(headers())
          .send(payload)
          .expect(201);
        expect(result.body).toMatchObject({
          success: true,
          plan: 'GROWTH',
          pricingModel: 'PER_SPINDLE',
          gracePeriodDays: 30,
        });
        expect(result.body).not.toHaveProperty('apiKey');
      }
      expect(await prisma.companyMetrics.count({ where: { companyId } })).toBe(
        1,
      );
      expect(
        (await prisma.company.findUniqueOrThrow({ where: { id: companyId } }))
          .docsPosted,
      ).toBe(9);
    },
  );

  it.each([
    { totalInwards: -1 },
    { totalInvoices: 1.5 },
    { totalOutwards: '2' },
    { activeUsers: null },
    { totalInwards: 2 ** 31 - 1 },
    { totalInwards: 2 ** 31 },
    { totalInvoices: undefined },
    { additionalMetrics: { customerEmail: 'private@example.test' } },
  ])(
    'rejects invalid metrics with unchanged persisted counters: %j',
    async (overrides) => {
      const before = await prisma.companyMetrics.findMany({
        where: { companyId },
      });
      await http()
        .post(`/companies/${companyId}/sync`)
        .set(headers())
        .send({ ...metrics, ...overrides })
        .expect(400);
      expect(
        await prisma.companyMetrics.findMany({ where: { companyId } }),
      ).toEqual(before);
    },
  );

  it('requires an app version on the versioned endpoint', async () => {
    await http()
      .post(`/companies/${companyId}/v1/sync`)
      .set(headers())
      .send(metrics)
      .expect(400);
  });

  it('rolls back metric updates when the company projection fails', async () => {
    const before = await prisma.companyMetrics.findMany({
      where: { companyId },
    });
    await prisma.$executeRawUnsafe(
      "CREATE TRIGGER reject_projection BEFORE UPDATE ON Company BEGIN SELECT RAISE(ABORT, 'test failure'); END",
    );
    try {
      await http()
        .post(`/companies/${companyId}/sync`)
        .set(headers())
        .send({ ...metrics, totalInwards: 10 })
        .expect(500);
      expect(
        await prisma.companyMetrics.findMany({ where: { companyId } }),
      ).toEqual(before);
    } finally {
      await prisma.$executeRawUnsafe('DROP TRIGGER reject_projection');
    }
  });

  it('rejects malformed IDs, unknown companies and unsupported action payloads', async () => {
    await http().get('/companies/not-a-uuid').set(headers()).expect(400);
    await http()
      .post(`/companies/${randomUUID()}/sync`)
      .set(headers())
      .send(metrics)
      .expect(404);
    await http()
      .post(`/companies/${companyId}/actions`)
      .set(headers())
      .send({ actionType: 'SHELL', command: 'invalid' })
      .expect(400);
    await http()
      .post(`/companies/${companyId}/actions`)
      .set(headers())
      .send({ actionType: 'FORCE_SYNC' })
      .expect(503);
  });
});
