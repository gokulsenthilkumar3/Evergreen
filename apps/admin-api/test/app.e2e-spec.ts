import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomBytes } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { AppModule } from '../src/app.module';

// Exercises the actual provider routes, guard and migrated SQLite database.
describe('Provider HTTP regression checks', () => {
  let app: INestApplication;
  const originalEnv = { ...process.env };
  const key = randomBytes(48).toString('hex');
  const headers = { Authorization: `Bearer ${key}` };

  beforeAll(async () => {
    const directory = mkdtempSync(join(tmpdir(), 'evergreen-provider-http-'));
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_DATABASE_URL = `file:${join(directory, 'admin.db').replace(/\\/g, '/')}`;
    process.env.ADMIN_API_KEY = key;
    const workspace = resolve(__dirname, '../../..');
    execFileSync(process.execPath, [
      resolve(workspace, 'node_modules/prisma/build/index.js'),
      'migrate', 'deploy', '--schema',
      resolve(workspace, 'packages/admin-database/prisma/schema.prisma'),
    ], { env: process.env, stdio: 'pipe', timeout: 30000 });
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    process.env = originalEnv;
  });

  it('rejects anonymous, wrong-key and localhost-origin requests', async () => {
    await request(app.getHttpServer()).get('/companies').expect(401);
    await request(app.getHttpServer()).get('/companies')
      .set('Origin', 'http://localhost:5174').set('Host', 'localhost:4300').expect(401);
    await request(app.getHttpServer()).get('/control/records')
      .set('Authorization', 'Bearer wrong-key').expect(401);
    await request(app.getHttpServer()).post('/cicd/build').send({}).expect(401);
  });

  it('reads an empty provider database without fabricated tenants or records', async () => {
    for (const path of ['/companies', '/control/records', '/cicd/releases', '/cicd/deployments', '/cicd/logs']) {
      const response = await request(app.getHttpServer()).get(path).set(headers).expect(200);
      expect(response.body).toEqual([]);
    }
  });

  it('persists license fields on the clean migration chain', async () => {
    const created = await request(app.getHttpServer()).post('/companies').set(headers)
      .send({ name: 'Migration test mill', tier: 'TIER_2_CITY', maxMachines: 7 }).expect(201);
    expect(created.body.maxMachines).toBe(7);
    expect(created.body.licenseKey).toMatch(/^EVG-/);
    const read = await request(app.getHttpServer()).get(`/companies/${created.body.id}`).set(headers).expect(200);
    expect(read.body.id).toBe(created.body.id);
    expect(read.body.actions).toEqual([]);
  });

  it('fails unavailable build and deployment operations without creating success records', async () => {
    await request(app.getHttpServer()).post('/cicd/build').set(headers)
      .send({ version: '1.0.0', name: 'Release', changelog: 'Test' }).expect(503);
    await request(app.getHttpServer()).post('/cicd/deploy').set(headers)
      .send({ companyId: 'unknown', packageVersion: '1.0.0' }).expect(503);
    const response = await request(app.getHttpServer()).get('/cicd/deployments').set(headers).expect(200);
    expect(response.body).toEqual([]);
  });
});
