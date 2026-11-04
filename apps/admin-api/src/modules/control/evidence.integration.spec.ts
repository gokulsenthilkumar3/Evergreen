import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer, Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/admin-client';
import { EvidenceService, deriveEvidence } from './evidence.service';
import { projectedPayload } from './payload-policy';
describe('persistent evidence ledger', () => {
  let db: PrismaClient, service: EvidenceService, server: Server;
  const prior = process.env.EVERGREEN_PROBE_TARGETS;
  beforeAll(async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'evergreen-evidence-'));
    const url = 'file:' + path.join(dir, 'test.db').replaceAll('\\', '/');
    const root = path.resolve(__dirname, '../../../../..');
    execFileSync(
      process.execPath,
      [
        path.join(root, 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema',
        'packages/admin-database/prisma/schema.prisma',
      ],
      {
        cwd: root,
        env: { ...process.env, ADMIN_DATABASE_URL: url },
        stdio: 'pipe',
      },
    );
    db = new PrismaClient({ datasources: { db: { url } } });
    service = new EvidenceService(db as never);
    await service.onModuleInit();
  }, 30000);
  afterAll(async () => {
    if (server)
      await new Promise<void>((resolve) => server.close(() => resolve()));
    await db?.$disconnect();
    if (prior === undefined) delete process.env.EVERGREEN_PROBE_TARGETS;
    else process.env.EVERGREEN_PROBE_TARGETS = prior;
  });
  it('paginates without truncation and rejects UPDATE/DELETE of history', async () => {
    for (let i = 0; i < 3; i++)
      await db.$transaction((tx) =>
        service.append(tx, {
          sourceKey: 'fixture:' + i,
          entityType: 'TEST',
          entityId: 'fixture',
          title: 'Event ' + i,
          actor: 'Test',
          action: 'SAVED',
          state: 'recorded',
          payload: { i },
        }),
      );
    const first = await service.ledger({ limit: '2' });
    expect(first.events).toHaveLength(2);
    expect(first.hasMore).toBe(true);
    const second = await service.ledger({
      limit: '2',
      cursor: first.nextCursor!,
    });
    expect(second.events).toHaveLength(1);
    expect(second.events[0].id).not.toBe(first.events[0].id);
    expect((await service.verifyChain()).ok).toBe(true);
    await expect(
      db.$executeRaw`UPDATE AuditLedger SET title='changed' WHERE seq=1`,
    ).rejects.toThrow();
    await expect(
      db.$executeRaw`DELETE FROM AuditLedger WHERE seq=1`,
    ).rejects.toThrow();
  });
  it('observes actual endpoint reachability, binds the record version, then expires proof', async () => {
    server = createServer((_req, res) => {
      res.writeHead(200);
      res.end();
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address() as { port: number };
    const row = await db.controlRecord.create({
      data: {
        kind: 'INTEGRATION',
        title: 'Local fixture endpoint',
        payload: '{}',
      },
    });
    process.env.EVERGREEN_PROBE_TARGETS = JSON.stringify({
      [row.id]: { url: 'http://127.0.0.1:' + address.port + '/health' },
    });
    const result = await service.probe('record', row.id, 'Test');
    expect(result.proof.state).toBe('verified');
    const observation = await service.evidence(result.proof.evidenceRef!);
    expect(
      deriveEvidence(
        'executed',
        observation,
        undefined,
        Date.parse(observation.observedAt) + 91000,
      ).state,
    ).toBe('stale');
    const decorated = await service.decorate([
      { ...row, payload: {}, proof: { state: 'recorded' } },
    ]);
    expect(decorated[0].proof.state).toBe('verified');
    const changed = await service.decorate([
      { ...row, version: 2, payload: {}, proof: { state: 'recorded' } },
    ]);
    expect(changed[0].proof.state).toBe('recorded');
    expect((await service.verifyChain()).ok).toBe(true);
  });
  it('records idempotent requests without implying execution', async () => {
    const key = randomUUID();
    const first: any = await service.request(
      'BACKUP',
      'provider',
      { requestKey: key },
      'Test',
    );
    const again: any = await service.request(
      'BACKUP',
      'provider',
      { requestKey: key },
      'Test',
    );
    expect(again.id).toBe(first.id);
    expect(first.state).toBe('requested');
    expect(await db.operationRequest.count()).toBe(1);
  });
  it('limits explorer reads and redacts unapproved payload fields and URL credentials', () => {
    for (let i = 0; i < 10; i++) service.limit('actor', 'explorer');
    expect(() => service.limit('actor', 'explorer')).toThrow('Rate limit');
    expect(
      projectedPayload({
        password: 'secret',
        amountPaise: 10,
        endpoint: 'https://user:pass@example.com/hook?token=secret',
        children: [{ title: 'Task', secret: 'hidden' }],
      }),
    ).toEqual({
      amountPaise: 10,
      endpoint: 'https://example.com/hook',
      children: [{ title: 'Task' }],
    });
  });
});
