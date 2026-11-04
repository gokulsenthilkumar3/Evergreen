import { PrismaClient } from '@prisma/client';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { appendUserAudit, USER_AUDIT_ROOT, userAuditHash } from './user-audit';

describe('Transactional user audit ledger', () => {
  let db: PrismaClient;
  beforeAll(async () => {
    const root = resolve(__dirname, '../../../..');
    const directory = resolve(root, '.evergreen/audit-tests'); mkdirSync(directory, { recursive: true });
    db = new PrismaClient({ datasources: { db: { url: `file:${resolve(directory, randomUUID() + '.db').replace(/\\/g, '/')}` } } });
    await db.$executeRawUnsafe('CREATE TABLE "User" ("id" INTEGER PRIMARY KEY, "publicId" TEXT UNIQUE, "username" TEXT UNIQUE, "name" TEXT, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    await db.$executeRawUnsafe('CREATE TABLE "ActivityLog" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "username" TEXT NOT NULL, "action" TEXT NOT NULL, "module" TEXT NOT NULL, "details" TEXT NOT NULL, "createdAt" DATETIME NOT NULL, "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    const migration = readFileSync(resolve(root, 'packages/database/prisma/migrations/20261101070000_user_audit_ledger/migration.sql'), 'utf8');
    for (const statement of migration.split(';').filter(value => value.trim())) await db.$executeRawUnsafe(statement);
    await db.$executeRawUnsafe('INSERT INTO "User" (id, publicId, username, name) VALUES (1, \'stable-id\', \'staff\', \'Original\')');
  });
  afterAll(async () => { await db?.$disconnect(); });
  const event = { data: { username: 'staff', action: 'UPDATE_USER', module: 'USER_MANAGEMENT', details: 'Updated user 1: name' } };
  it('rolls back the mutation and both audit records when the transaction fails', async () => {
    await expect(db.$transaction(async tx => {
      await tx.user.updateMany({ where: { id: 1 }, data: { name: 'Changed' } });
      await appendUserAudit(tx, event, 1);
      throw new Error('simulated write failure');
    })).rejects.toThrow('simulated write failure');
    expect(await db.user.findUnique({ where: { id: 1 }, select: { name: true } })).toEqual({ name: 'Original' });
    expect(await db.userAuditLedger.count()).toBe(0);
    expect(await db.activityLog.count()).toBe(0);
  });
  it('links committed events, retains stable IDs, and detects payload changes', async () => {
    await db.$transaction(tx => appendUserAudit(tx, event, 1));
    await db.$transaction(tx => appendUserAudit(tx, event, 1));
    const rows = await db.userAuditLedger.findMany({ orderBy: { id: 'asc' } });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ previousHash: USER_AUDIT_ROOT, actorPublicId: 'stable-id', subjectPublicId: 'stable-id' });
    expect(rows[1].previousHash).toBe(rows[0].hash);
    for (const row of rows) expect(userAuditHash(row)).toBe(row.hash);
    expect(userAuditHash({ ...rows[0], details: 'tampered' })).not.toBe(rows[0].hash);
    expect(await db.activityLog.count()).toBe(2);
  });
});
