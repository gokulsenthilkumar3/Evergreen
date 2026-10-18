import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import type { Server } from 'node:http';
import request from 'supertest';
import { PrismaService } from '../../services/prisma.service';
import { ProviderAccessGuard } from '../../guards/provider-access.guard';
import { CicdController } from './cicd.controller';
import { CicdService } from './cicd.service';

describe('Release jobs through authenticated HTTP and a temporary database', () => {
  let app: INestApplication<Server>,
    prisma: PrismaService,
    directory: string,
    companyId: string;
  const originalEnv = { ...process.env },
    originalFetch = global.fetch;
  const key = randomBytes(32).toString('hex');
  let dispatches = 0;
  const http = () => request(app.getHttpServer());
  const headers = () => ({ Authorization: `Bearer ${key}` });
  const body = () => ({
    companyId,
    packageVersion: '1.0.0',
    requestKey: randomUUID(),
    strategy: 'MAINTENANCE',
  });
  beforeAll(async () => {
    directory = mkdtempSync(join(tmpdir(), 'evergreen-release-http-'));
    const root = resolve(__dirname, '../../../../..');
    process.env.ADMIN_DATABASE_URL = `file:${join(directory, 'provider.db').replaceAll('\\', '/')}`;
    process.env.ADMIN_API_KEY = key;
    process.env.ADMIN_API_ACTOR = 'Release HTTP operator';
    process.env.EVERGREEN_GITHUB_REPOSITORY = 'example/evergreen';
    process.env.EVERGREEN_GITHUB_TOKEN =
      'test-credential-used-only-by-mocked-fetch';
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
      controllers: [CicdController],
      providers: [
        CicdService,
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
    companyId = (
      await prisma.company.create({
        data: { name: 'Release fixture', apiKey: randomUUID() },
      })
    ).id;
    process.env.EVERGREEN_DEPLOY_TARGETS = JSON.stringify({
      [companyId]: 'fixture',
    });
    global.fetch = jest.fn(async (url) => {
      const route = String(url);
      if (route.endsWith('/dispatches')) {
        dispatches++;
        return new Response(null, { status: 204 });
      }
      return new Response(
        JSON.stringify(
          route.includes('/commits/')
            ? { sha: 'a'.repeat(40) }
            : { tag_name: 'v1.0.0', draft: false, prerelease: false },
        ),
        { headers: { 'Content-Type': 'application/json' } },
      );
    });
  }, 60_000);
  afterAll(async () => {
    if (app) await app.close();
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
    if (directory && dirname(resolve(directory)) === resolve(tmpdir()))
      rmSync(directory, { recursive: true });
  });
  it('anonymous requests and forged actor/target fields create no job', async () => {
    await http().post('/cicd/deploy').send(body()).expect(401);
    await http()
      .post('/cicd/deploy')
      .set(headers())
      .send({ ...body(), triggeredBy: 'forged', target: 'other' })
      .expect(400);
    expect(await prisma.releaseJob.count()).toBe(0);
    expect(dispatches).toBe(0);
  });
  it('concurrent retries persist one job and dispatch exactly one workflow', async () => {
    const input = body();
    const responses = await Promise.all([
      http().post('/cicd/deploy').set(headers()).send(input),
      http().post('/cicd/deploy').set(headers()).send(input),
    ]);
    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(responses[0].body.id).toBe(responses[1].body.id);
    expect(dispatches).toBe(1);
    expect(await prisma.releaseJob.count()).toBe(1);
    const job = await prisma.releaseJob.findFirstOrThrow();
    expect(job.actor).toBe('Release HTTP operator');
    expect(job.status).toBe('QUEUED');
    await http().post('/cicd/deploy').set(headers()).send(input).expect(201);
    expect(dispatches).toBe(1);
  });
  it('the active installation lock rejects a separate request without another dispatch', async () => {
    await http().post('/cicd/deploy').set(headers()).send(body()).expect(409);
    expect(dispatches).toBe(1);
  });
});
