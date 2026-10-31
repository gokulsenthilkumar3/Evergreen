import { InstallationLicenseGuard } from '../src/guards/installation-license.guard';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { randomBytes } from 'crypto';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { execFileSync } from 'child_process';
import { AppModule } from '../src/app.module';
import { EmailService } from '../src/modules/auth/email.service';
import { PrismaService } from '../src/services/prisma.service';

// Real HTTP, guards, Prisma and migrations against a throwaway database.
describe('P0 safety: public surfaces and the costing kill-switch', () => {
  let app: INestApplication;
  let admin: { Authorization: string };
  let modifier: { Authorization: string };
  let viewer: { Authorization: string };
  const password = randomBytes(24).toString('hex');
  const workspace = resolve(__dirname, '../../..');
  const http = () => request(app.getHttpServer());
  const signIn = async (username: string) => {
    const login = await http()
      .post('/auth/login')
      .send({ username, password })
      .expect(201);
    return { Authorization: `Bearer ${login.body.access_token}` };
  };

  beforeAll(async () => {
    const directory = mkdtempSync(join(tmpdir(), 'evergreen-p0-'));
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = `file:${join(directory, 'test.db').replace(/\\/g, '/')}`;
    process.env.JWT_SECRET = randomBytes(48).toString('hex');
    process.env.BOOTSTRAP_ADMIN_USERNAME = 'p0-admin';
    process.env.BOOTSTRAP_ADMIN_EMAIL = 'p0-admin@example.test';
    process.env.BOOTSTRAP_ADMIN_PASSWORD = password;
    process.env.SMTP_HOST = '';
    process.env.DAILY_SUMMARY_EMAIL = '';
    execFileSync(
      process.execPath,
      [
        resolve(workspace, 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema',
        resolve(workspace, 'packages/database/prisma/schema.prisma'),
      ],
      { env: process.env, stdio: 'pipe' },
    );
    const module = await Test.createTestingModule({ imports: [AppModule] })
      // The business fixture represents an activated deployment. Licence enforcement has separate cryptographic and guard tests.
      .overrideProvider(InstallationLicenseGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(EmailService)
      .useValue({ sendLoginNotification: () => Promise.resolve() })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    admin = await signIn('p0-admin');
    await http()
      .post('/users')
      .set(admin)
      .send({
        username: 'p0-modifier',
        email: 'p0-modifier@example.test',
        password,
        role: 'MODIFIER',
      })
      .expect(201);
    await http()
      .post('/users')
      .set(admin)
      .send({
        username: 'p0-viewer',
        email: 'p0-viewer@example.test',
        password,
        role: 'VIEWER',
      })
      .expect(201);
    modifier = await signIn('p0-modifier');
    viewer = await signIn('p0-viewer');
  }, 90000);

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('health and status', () => {
    it.each(['/', '/health'])(
      'GET %s is public and discloses only the probe fields',
      async (path) => {
        const res = await http().get(path).expect(200);
        expect(Object.keys(res.body).sort()).toEqual([
          'database',
          'service',
          'status',
          'timestamp',
        ]);
        expect(res.body).toMatchObject({
          service: 'evergreen-api',
          status: 'ok',
          database: true,
        });
      },
    );

    it('ignores a token in the query string instead of acting on it', async () => {
      const token = admin.Authorization.slice(7);
      const res = await http()
        .get(`/health?token=${token}&ui=1`)
        .set('Accept', 'text/html')
        .expect(200);
      expect(res.type).toBe('application/json');
      expect(res.text).not.toContain(token);
    });

    it('keeps operational detail behind an administrator sign-in', async () => {
      await http().get('/status').expect(401);
      await http().get('/status').set(viewer).expect(403);
      await http().get('/status').set(modifier).expect(403);
      const res = await http().get('/status').set(admin).expect(200);
      expect(res.body).toMatchObject({
        status: 'ok',
        startupIssue: null,
        dataIssues: [],
      });
      expect(res.body.processors.length).toBeGreaterThan(0);
      expect(JSON.stringify(res.body)).not.toMatch(/5555|Database Studio/);
    });

    it.each([
      ['get', '/api/status'],
      ['get', '/api/processors/sync'],
      ['post', '/api/processors/sync'],
      ['post', '/api/processors/ping/db-engine'],
    ] as const)('%s %s no longer exists', async (method, path) => {
      await http()[method](path).set(admin).expect(404);
    });
  });

  describe('costing', () => {
    const expense = (body: object) =>
      http()
        .post('/costing/expense')
        .set(modifier)
        .send({ date: '2026-10-01', title: 'Probe', type: 'General', ...body });
    // Zero-amount rows can no longer be created through the API; older databases may still hold them.
    const legacyZeroEntry = (title: string) =>
      app.get(PrismaService).costingEntry.create({
        data: {
          date: new Date('2026-10-01'),
          category: 'Expense',
          title,
          totalCost: 0,
          details: `${title} (General)`,
        },
      });

    it('cannot turn an unposted entry negative and take every posting down with it', async () => {
      const zero = await legacyZeroEntry('Legacy zero');

      for (const totalCost of [-1, '-0.01', 'abc', '12abc', 1e12, { $gt: 0 }])
        await http()
          .put(`/costing/${zero.id}`)
          .set(modifier)
          .send({ totalCost })
          .expect(400);

      // The ledger still accepts postings, and a restart still reconciles cleanly.
      await expense({ amount: 250, title: 'Still posting' }).expect(201);
      const prisma = app.get(PrismaService);
      await expect(prisma.onModuleInit()).resolves.toBeUndefined();
      expect(prisma.getStartupIssue()).toBeNull();
      const health = await http().get('/health').expect(200);
      expect(health.body.status).toBe('ok');
    });

    it('posts a corrected amount once and then treats the entry as closed', async () => {
      const zero = await legacyZeroEntry('Fix me');
      const fixed = await http()
        .put(`/costing/${zero.id}`)
        .set(modifier)
        .send({ totalCost: 120.5 })
        .expect(200);
      expect(fixed.body).toMatchObject({
        totalCost: 120.5,
        updatedBy: 'p0-modifier',
        category: 'Expense',
      });
      const journal = await app.get(PrismaService).journalEntry.findUnique({
        where: { sourceKey: `COST:${zero.id}` },
        include: { lines: true },
      });
      expect(
        journal?.lines.map((line) => [line.account, line.debit, line.credit]),
      ).toEqual(
        expect.arrayContaining([
          ['MANUFACTURING_OVERHEAD', 120.5, 0],
          ['ACCRUED_EXPENSES', 0, 120.5],
        ]),
      );
      await http()
        .put(`/costing/${zero.id}`)
        .set(modifier)
        .send({ totalCost: 1 })
        .expect(400);
      await http().delete(`/costing/${zero.id}`).set(admin).expect(400);
    });

    it('records the signed-in user and rejects a name, category or unknown field sent by the caller', async () => {
      const created = await expense({
        amount: 10,
        title: 'Honest author',
      }).expect(201);
      expect(created.body).toMatchObject({
        createdBy: 'p0-modifier',
        category: 'Expense',
        totalCost: 10,
      });
      for (const forged of [
        { createdBy: 'someone-else' },
        { category: 'EB (Electricity)' },
        { totalCost: 1 },
        { id: 1 },
      ])
        await expense({ amount: 10, ...forged }).expect(400);

      const zero = await legacyZeroEntry('Forged editor');
      for (const forged of [
        { createdBy: 'someone-else' },
        { updatedBy: 'someone-else' },
        { category: 'Employee' },
      ])
        await http()
          .put(`/costing/${zero.id}`)
          .set(modifier)
          .send({ title: 'Edited', ...forged })
          .expect(400);
      const updated = await http()
        .put(`/costing/${zero.id}`)
        .set(modifier)
        .send({ title: 'Edited' })
        .expect(200);
      expect(updated.body).toMatchObject({
        updatedBy: 'p0-modifier',
        category: 'Expense',
        title: 'Edited',
      });
    });

    it('rejects zero, negative, text and malformed input on create', async () => {
      await expense({ amount: 0 }).expect(400);
      await expense({ amount: -5 }).expect(400);
      await expense({ amount: '250' }).expect(400);
      await expense({ amount: 10, date: 'soon' }).expect(400);
      await expense({ amount: 10, title: '' }).expect(400);
      await http()
        .post('/costing/eb')
        .set(modifier)
        .send({ date: '2026-10-02', unitsConsumed: -100, ratePerUnit: 8 })
        .expect(400);
      await http()
        .post('/costing/eb')
        .set(modifier)
        .send({
          date: '2026-10-02',
          unitsConsumed: 100,
          ratePerUnit: 8,
          noOfShifts: 1.5,
        })
        .expect(400);
      await http()
        .post('/costing/employee')
        .set(modifier)
        .send({ date: '2026-10-02', workers: 2.5, rate: 600 })
        .expect(400);
      await http()
        .post('/costing/packaging')
        .set(modifier)
        .send({ date: '2026-10-02', ratePerKg: 1.6 })
        .expect(400);
      await http()
        .post('/costing/maintenance')
        .set(modifier)
        .send({ date: '2026-10-02', totalCost: 0 })
        .expect(400);
    });

    it('works out electricity, labour and packaging totals on the server', async () => {
      // A total supplied by the caller is not an accepted field for these categories.
      await http()
        .post('/costing/eb')
        .set(modifier)
        .send({
          date: '2026-10-04',
          unitsConsumed: 100,
          ratePerUnit: 8,
          totalCost: 1,
        })
        .expect(400);

      const eb = await http()
        .post('/costing/eb')
        .set(modifier)
        .send({
          date: '2026-10-04',
          unitsConsumed: 120.5,
          ratePerUnit: 8,
          noOfShifts: 2,
        })
        .expect(201);
      expect(eb.body).toMatchObject({
        category: 'EB (Electricity)',
        totalCost: 1928,
        details: '120.5 kWh @ ₹8/unit (2 Shifts)',
        createdBy: 'p0-modifier',
      });

      const labour = await http()
        .post('/costing/employee')
        .set(modifier)
        .send({
          date: '2026-10-04',
          workers: 12,
          rate: 550.5,
          noOfShifts: 3,
          overtime: 900,
        })
        .expect(201);
      expect(labour.body).toMatchObject({
        category: 'Employee',
        totalCost: 20718,
        workers: 12,
        rate: 550.5,
      });

      const packaging = await http()
        .post('/costing/packaging')
        .set(modifier)
        .send({ date: '2026-10-04', yarnProduced: 333.33, ratePerKg: 1.6 })
        .expect(201);
      expect(packaging.body).toMatchObject({
        category: 'Packaging',
        totalCost: 533.33,
        details: 'For 333.33 kg Yarn',
      });

      const maintenance = await http()
        .post('/costing/maintenance')
        .set(modifier)
        .send({ date: '2026-10-04', totalCost: 5000, ratePerKg: 4 })
        .expect(201);
      expect(maintenance.body).toMatchObject({
        category: 'Maintenance',
        totalCost: 5000,
      });

      const journal = await app.get(PrismaService).journalEntry.findUnique({
        where: { sourceKey: `COST:${labour.body.id}` },
        include: { lines: true },
      });
      expect(
        journal?.lines.find((line) => line.account === 'MANUFACTURING_OVERHEAD')
          ?.debit,
      ).toBe(20718);
    });

    it('answers a second daily entry with 409 and a missing entry with 404', async () => {
      const eb = {
        date: '2026-10-03',
        unitsConsumed: 100,
        ratePerUnit: 8,
        noOfShifts: 1,
      };
      const first = await http()
        .post('/costing/eb')
        .set(modifier)
        .send(eb)
        .expect(201);
      expect(first.body).toMatchObject({
        category: 'EB (Electricity)',
        details: '100 kWh @ ₹8/unit (1 Shifts)',
        totalCost: 800,
      });
      await http().post('/costing/eb').set(modifier).send(eb).expect(409);
      // General expenses may repeat on one day.
      await expense({ amount: 5, title: 'Tea' }).expect(201);
      await expense({ amount: 5, title: 'Tea' }).expect(201);
      await http()
        .put('/costing/999999')
        .set(modifier)
        .send({ totalCost: 5 })
        .expect(404);
      await http()
        .put('/costing/abc')
        .set(modifier)
        .send({ totalCost: 5 })
        .expect(404);
      await http().delete('/costing/999999').set(admin).expect(404);
    });

    it('stays usable with several invalid stored rows and lets each be repaired in turn', async () => {
      const prisma = app.get(PrismaService);
      const bad = (title: string) =>
        prisma.costingEntry.create({
          data: {
            date: new Date('2026-10-05'),
            category: 'Expense',
            title,
            totalCost: -50,
            details: title,
          },
        });
      const [first, second] = [await bad('Corrupt A'), await bad('Corrupt B')];

      // A restart still succeeds; the probe says degraded and only administrators see why.
      await expect(prisma.onModuleInit()).resolves.toBeUndefined();
      expect(prisma.getStartupIssue()).toBeNull();
      const probe = await http().get('/health').expect(200);
      expect(probe.body).toEqual(
        expect.objectContaining({ status: 'degraded', database: true }),
      );
      expect(JSON.stringify(probe.body)).not.toContain('Cost entry');
      const before = await http().get('/status').set(admin).expect(200);
      expect(before.body.dataIssues).toEqual([
        expect.stringContaining(`Cost entry #${first.id}`),
        expect.stringContaining(`Cost entry #${second.id}`),
      ]);

      // Unrelated postings are not blocked, and neither invalid row reached the journal.
      await expense({ amount: 75, title: 'Posting while degraded' }).expect(
        201,
      );
      expect(
        await prisma.journalEntry.count({
          where: {
            sourceKey: { in: [`COST:${first.id}`, `COST:${second.id}`] },
          },
        }),
      ).toBe(0);

      // Repair one while the other is still invalid, then remove the other.
      await http()
        .put(`/costing/${first.id}`)
        .set(modifier)
        .send({ totalCost: 50 })
        .expect(200);
      const between = await http().get('/status').set(admin).expect(200);
      expect(between.body.dataIssues).toEqual([
        expect.stringContaining(`Cost entry #${second.id}`),
      ]);
      await http().delete(`/costing/${second.id}`).set(admin).expect(200);

      const after = await http().get('/status').set(admin).expect(200);
      expect(after.body).toMatchObject({
        status: 'ok',
        dataIssues: [],
        startupIssue: null,
      });
      const healthy = await http().get('/health').expect(200);
      expect(healthy.body.status).toBe('ok');
      expect(
        await prisma.journalEntry.count({
          where: { sourceKey: `COST:${first.id}` },
        }),
      ).toBe(1);
    });

    it('marks posted entries in the list so the client can stop offering edits', async () => {
      const zero = await legacyZeroEntry('Unposted');
      const paid = await expense({ amount: 30, title: 'Posted' }).expect(201);
      const list = await http().get('/costing/entries').set(viewer).expect(200);
      const byId = new Map<number, { posted: boolean }>(
        list.body.map((entry: { id: number; posted: boolean }) => [
          entry.id,
          entry,
        ]),
      );
      expect(byId.get(paid.body.id)?.posted).toBe(true);
      expect(byId.get(zero.id)?.posted).toBe(false);
    });

    it('keeps viewers out of every costing write', async () => {
      await http()
        .post('/costing/expense')
        .set(viewer)
        .send({ date: '2026-10-01', title: 'No', amount: 1 })
        .expect(403);
      await http()
        .put('/costing/1')
        .set(viewer)
        .send({ totalCost: 1 })
        .expect(403);
      await http().delete('/costing/1').set(modifier).expect(403);
    });
  });
});
