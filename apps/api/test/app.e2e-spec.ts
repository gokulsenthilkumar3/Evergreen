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
    process.env.DAILY_SUMMARY_EMAIL = '';
    execFileSync(process.execPath, [resolve(workspace, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--schema', resolve(workspace, 'packages/database/prisma/schema.prisma')], { env: process.env, stdio: 'pipe' });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EmailService).useValue({ sendLoginNotification: async () => undefined }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    const login = await request(app.getHttpServer()).post('/auth/login').send({ username: 'release-admin', password }).expect(201);
    adminToken = login.body.access_token;
    adminId = login.body.user.id;
  }, 60000);

  afterAll(async () => { if (app) await app.close(); });

  it('rejects anonymous access and malformed login fields', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
    await request(app.getHttpServer()).post('/auth/login').send({ username: 'release-admin', password, totpCode: '12ab34' }).expect(400);
  });

  it('rejects injected user fields and invalid settings before persistence', async () => {
    await request(app.getHttpServer()).post('/users').set(headers()).send({ username: 'unsafe', email: 'unsafe@example.test', password, isTotpEnabled: true }).expect(400);
    await request(app.getHttpServer()).put('/settings').set(headers()).send({ autoBackup: 'false' }).expect(400);
    await request(app.getHttpServer()).put('/settings').set(headers()).send({ gstPercent: '101' }).expect(400);
    await request(app.getHttpServer()).put('/settings').set(headers()).send({ updatedBy: 'forged' }).expect(400);
    await request(app.getHttpServer()).put('/settings').set(headers()).send({ phone: null }).expect(400);
  });

  it('protects the last administrator and rejects malformed IDs', async () => {
    await request(app.getHttpServer()).put(`/users/${adminId}`).set(headers()).send({ role: 'VIEWER' }).expect(400);
    await request(app.getHttpServer()).delete(`/users/${adminId}`).set(headers()).expect(400);
    await request(app.getHttpServer()).put('/users/not-an-id').set(headers()).send({ name: 'Name' }).expect(400);
  });

  it('enforces viewer permissions, protects user output and revokes logout sessions', async () => {
    const created = await request(app.getHttpServer()).post('/users').set(headers()).send({ username: 'viewer', email: 'viewer@example.test', password, role: 'VIEWER' }).expect(201);
    expect(created.body.createdBy).toBe('release-admin');
    for (const secret of ['password', 'totpSecret', 'currentChallenge']) expect(created.body).not.toHaveProperty(secret);
    const login = await request(app.getHttpServer()).post('/auth/login').send({ username: 'viewer', password }).expect(201);
    const viewer = { Authorization: `Bearer ${login.body.access_token}` };
    await request(app.getHttpServer()).get('/auth/me').set(viewer).expect(200);
    await request(app.getHttpServer()).get('/users').set(viewer).expect(403);
    await request(app.getHttpServer()).put('/settings').set(viewer).send({ companyName: 'Denied' }).expect(403);
    await request(app.getHttpServer()).post('/commerce/items').set(viewer).send({}).expect(403);
    await request(app.getHttpServer()).delete('/auth/logout').set(viewer).expect(200);
    await request(app.getHttpServer()).get('/auth/me').set(viewer).expect(401);
  });

  it('revokes existing sessions when an administrator resets a password', async () => {
    const user = await request(app.getHttpServer()).post('/users').set(headers()).send({ username: 'reset-user', email: 'reset@example.test', password }).expect(201);
    const login = await request(app.getHttpServer()).post('/auth/login').send({ username: 'reset-user', password }).expect(201);
    await request(app.getHttpServer()).put(`/users/${user.body.id}`).set(headers()).send({ password: randomBytes(24).toString('hex') }).expect(200);
    await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${login.body.access_token}`).expect(401);
  });
});
