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

// Real HTTP, JWT, role guards, Prisma, and migrations. No production database or mail.
describe('Release HTTP regression checks', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminId: number;
  const password = randomBytes(24).toString('hex');
  const workspace = resolve(__dirname, '../../..');
  const headers = () => ({ Authorization: `Bearer ${adminToken}` });

  beforeAll(async () => {
    const directory = mkdtempSync(join(tmpdir(), 'evergreen-http-'));
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = `file:${join(directory, 'test.db').replace(/\\/g, '/')}`;
    process.env.JWT_SECRET = randomBytes(48).toString('hex');
    process.env.BOOTSTRAP_ADMIN_USERNAME = 'release-admin';
    process.env.BOOTSTRAP_ADMIN_EMAIL = 'release-admin@example.test';
    process.env.BOOTSTRAP_ADMIN_PASSWORD = password;
    process.env.SMTP_HOST = '';
    process.env.GROQ_API_KEY = '';
    process.env.GROQ_PUBLIC_API_KEY = '';
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
      // Licence cryptography and fail-closed route coverage have dedicated tests; this fixture tests business HTTP flows.
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
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'release-admin', password })
      .expect(201);
    adminToken = login.body.access_token;
    adminId = login.body.user.id;
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('rejects anonymous access and malformed login fields', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'release-admin', password, totpCode: '12ab34' })
      .expect(400);
  });

  it('rejects injected user fields and invalid settings before persistence', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .set(headers())
      .send({
        username: 'unsafe',
        email: 'unsafe@example.test',
        password,
        isTotpEnabled: true,
      })
      .expect(400);
    await request(app.getHttpServer())
      .put('/settings')
      .set(headers())
      .send({ autoBackup: 'false' })
      .expect(400);
    await request(app.getHttpServer())
      .put('/settings')
      .set(headers())
      .send({ gstPercent: '101' })
      .expect(400);
    await request(app.getHttpServer())
      .put('/settings')
      .set(headers())
      .send({ updatedBy: 'forged' })
      .expect(400);
    await request(app.getHttpServer())
      .put('/settings')
      .set(headers())
      .send({ phone: null })
      .expect(400);
  });

  it('protects the last administrator and rejects malformed IDs', async () => {
    await request(app.getHttpServer())
      .put(`/users/${adminId}`)
      .set(headers())
      .send({ role: 'VIEWER' })
      .expect(400);
    await request(app.getHttpServer())
      .delete(`/users/${adminId}`)
      .set(headers())
      .expect(400);
    await request(app.getHttpServer())
      .put('/users/not-an-id')
      .set(headers())
      .send({ name: 'Name' })
      .expect(400);
  });

  it('enforces viewer permissions, protects user output and revokes logout sessions', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .set(headers())
      .send({
        username: 'viewer',
        email: 'viewer@example.test',
        password,
        role: 'VIEWER',
      })
      .expect(201);
    expect(created.body.createdBy).toBe('release-admin');
    for (const secret of ['password', 'totpSecret', 'currentChallenge'])
      expect(created.body).not.toHaveProperty(secret);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'viewer', password })
      .expect(201);
    const viewer = { Authorization: `Bearer ${login.body.access_token}` };
    await request(app.getHttpServer()).get('/auth/me').set(viewer).expect(200);
    await request(app.getHttpServer()).get('/users').set(viewer).expect(403);
    await request(app.getHttpServer())
      .put('/settings')
      .set(viewer)
      .send({ companyName: 'Denied' })
      .expect(403);
    await request(app.getHttpServer())
      .post('/commerce/items')
      .set(viewer)
      .send({})
      .expect(403);
    await request(app.getHttpServer())
      .delete('/auth/logout')
      .set(viewer)
      .expect(200);
    await request(app.getHttpServer()).get('/auth/me').set(viewer).expect(401);
  });

  it('persists retry-safe helpdesk tickets with staff isolation and administrator updates', async () => {
    const viewers: { Authorization: string }[] = [];
    for (const username of ['ticket-alice', 'ticket-bob']) {
      await request(app.getHttpServer()).post('/users').set(headers()).send({ username, email: `${username}@example.test`, password, role: 'VIEWER' }).expect(201);
      const login = await request(app.getHttpServer()).post('/auth/login').send({ username, password }).expect(201);
      viewers.push({ Authorization: `Bearer ${login.body.access_token}` });
    }
    const body = { requestKey: '87b51342-f0c8-4f6f-884a-ebebd1c575a1', subject: 'Ticket isolation test', description: 'Open an invoice and observe an error in the preview', category: 'BUG', priority: 'NORMAL' };
    await request(app.getHttpServer()).get('/helpdesk/tickets').expect(401);
    const first = await request(app.getHttpServer()).post('/helpdesk/tickets').set(viewers[0]).send(body).expect(201);
    const retry = await request(app.getHttpServer()).post('/helpdesk/tickets').set(viewers[0]).send(body).expect(201);
    expect(retry.body.id).toBe(first.body.id);
    const own = await request(app.getHttpServer()).get('/helpdesk/tickets').set(viewers[0]).expect(200);
    expect(own.body.map((ticket: { id: string }) => ticket.id)).toContain(first.body.id);
    const other = await request(app.getHttpServer()).get('/helpdesk/tickets').set(viewers[1]).expect(200);
    expect(other.body).toEqual([]);
    await request(app.getHttpServer()).post('/helpdesk/tickets').set(viewers[1]).send(body).expect(409);
    await request(app.getHttpServer()).patch(`/helpdesk/tickets/${first.body.id}`).set(viewers[0]).send({ status: 'RESOLVED', resolution: 'forged', version: 1 }).expect(403);
    await request(app.getHttpServer()).post('/helpdesk/tickets').set(viewers[0]).send({ ...body, createdBy: 'owner' }).expect(400);
    await request(app.getHttpServer()).patch(`/helpdesk/tickets/${first.body.id}`).set(headers()).send({ status: 'RESOLVED', version: 1 }).expect(409);
    const resolved = await request(app.getHttpServer()).patch(`/helpdesk/tickets/${first.body.id}`).set(headers()).send({ status: 'RESOLVED', resolution: 'Configuration corrected', version: 1 }).expect(200);
    expect(resolved.body.version).toBe(2);
    await request(app.getHttpServer()).patch(`/helpdesk/tickets/${first.body.id}`).set(headers()).send({ status: 'OPEN', version: 1 }).expect(409);
  });

  it('requires staff authentication for Loom and reports unconfigured public AI without generating fake content', async () => {
    await request(app.getHttpServer()).post('/ai/staff').send({ message: 'hello' }).expect(401);
    const staff = await request(app.getHttpServer()).get('/ai/staff').set(headers()).expect(200);
    expect(staff.body).toMatchObject({ name: 'EverGreen Loom', configured: false, advisoryOnly: true });
    for (const scope of ['customer', 'marketing']) {
      const status = await request(app.getHttpServer()).get(`/ai/${scope}`).expect(200);
      expect(status.body.configured).toBe(false);
      const answer = await request(app.getHttpServer()).post(`/ai/${scope}`).send({ message: 'hello' }).expect(503);
      expect(answer.body.answer).toBeUndefined();
    }
  });

  it('revokes existing sessions when an administrator resets a password', async () => {
    const user = await request(app.getHttpServer())
      .post('/users')
      .set(headers())
      .send({ username: 'reset-user', email: 'reset@example.test', password })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'reset-user', password })
      .expect(201);
    await request(app.getHttpServer())
      .put(`/users/${user.body.id}`)
      .set(headers())
      .send({ password: randomBytes(24).toString('hex') })
      .expect(200);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .expect(401);
  });
});
