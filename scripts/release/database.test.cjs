const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { databaseUrl, snapshot, inspect, migrate } = require('./database.cjs');
const root = path.resolve(__dirname, '../..');
function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-snapshot-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir())); fs.rmSync(directory, { recursive: true }); });
  return directory;
}
test('online snapshot includes committed WAL entries, verifies integrity and preserves accounting rows', async t => {
  const directory = fixture(t), source = path.join(directory, 'source.db'), target = path.join(directory, 'snapshot.db');
  const db = new PrismaClient({ datasources: { db: { url: databaseUrl(source) } } });
  try {
    await db.$queryRawUnsafe('PRAGMA journal_mode=WAL');
    await db.$executeRawUnsafe('CREATE TABLE Ledger(id INTEGER PRIMARY KEY, amountPaise INTEGER NOT NULL)');
    await db.$executeRawUnsafe('INSERT INTO Ledger(amountPaise) VALUES (12345), (-12345)');
    const manifest = await snapshot(root, source, target);
    assert.equal(manifest.counts.Ledger, 2);
    assert.equal(manifest.sha256, createHash('sha256').update(fs.readFileSync(target)).digest('hex'));
    const restored = new PrismaClient({ datasources: { db: { url: databaseUrl(target) } } });
    try {
      assert.deepEqual(await restored.$queryRawUnsafe('SELECT amountPaise FROM Ledger ORDER BY id'), [{ amountPaise: 12345 }, { amountPaise: -12345 }]);
    } finally { await restored.$disconnect(); }
    await assert.rejects(snapshot(root, source, target), /already exists/);
    assert.equal((await inspect(root, source)).Ledger, 2);
  } finally { await db.$disconnect(); }
});
test('the complete customer history migrates a fresh disposable database and can be snapshotted', async t => {
  const directory = fixture(t), source = path.join(directory, 'fresh.db');
  await migrate(root, source);
  const counts = await inspect(root, source);
  assert.ok(counts._prisma_migrations > 0);
  assert.equal(counts.Invoice, 0);
  const manifest = await snapshot(root, source, path.join(directory, 'restore.db'));
  assert.deepEqual(manifest.counts, counts);
});
test('a rejected migration does not modify the original database generation', async t => {
  const directory = fixture(t), source = path.join(directory, 'original.db'), candidate = path.join(directory, 'candidate.db');
  const db = new PrismaClient({ datasources: { db: { url: databaseUrl(source) } } });
  await db.$executeRawUnsafe('CREATE TABLE Preserved(id INTEGER PRIMARY KEY)');
  await db.$executeRawUnsafe('INSERT INTO Preserved VALUES (42)');
  await db.$disconnect();
  await snapshot(root, source, candidate);
  // This existing unbaselined database must be rejected by migrate deploy.
  await assert.rejects(migrate(root, candidate), /migration failed/);
  assert.equal((await inspect(root, source)).Preserved, 1);
});
