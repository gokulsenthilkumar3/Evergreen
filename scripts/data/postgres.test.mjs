import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { migratePostgres } from './migrate-postgres.mjs';
import { postgresSchema } from './postgres-schema.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const { PrismaClient, Prisma } = require('@prisma/client');
const { createDatabaseClient, decodeDecimals } = require('../../packages/database/runtime-client');

test('PostgreSQL schema uses exact decimals and runtime preserves number/date contracts', () => {
  const schema = postgresSchema('provider = "sqlite"\n  total Float\n  quantity Float?');
  assert.match(schema, /total Decimal @db.Decimal\(24, 2\)/);
  assert.match(schema, /quantity Decimal\? @db.Decimal\(24, 6\)/);
  assert.doesNotMatch(schema, /\bFloat\b/);
  const date = new Date();
  assert.deepEqual(decodeDecimals({ amount: new Prisma.Decimal('0.30'), date }), { amount: 0.3, date });
  assert.throws(() => decodeDecimals(new Prisma.Decimal('999999999999999999.99')), /numeric precision/);
});

test('copies SQLite into empty PostgreSQL, reconciles decimal totals, restores sequences and preserves source', {
  skip: !process.env.EVERGREEN_PG_TEST_URL, timeout: 300_000,
}, async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-pg-migration-'));
  const sourceFile = path.join(directory, 'source.db');
  t.after(() => {
    const resolved = fs.realpathSync(directory);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(resolved), /^evergreen-pg-migration-/);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const targetUrl = process.env.EVERGREEN_PG_TEST_URL;
  const targetMigration = spawnSync(process.execPath, [path.join(root, 'node_modules/prisma/build/index.js'),
    'migrate', 'deploy', '--schema', path.join(root, 'packages/database/prisma/postgres/schema.prisma')], {
    cwd: root, env: { ...process.env, DATABASE_URL: targetUrl }, encoding: 'utf8', windowsHide: true,
  });
  assert.equal(targetMigration.status, 0, 'Disposable PostgreSQL schema setup failed');
  const migrated = spawnSync(process.execPath, [path.join(root, 'node_modules/prisma/build/index.js'),
    'migrate', 'deploy', '--schema', path.join(root, 'packages/database/prisma/schema.prisma')], {
    cwd: root, env: { ...process.env, DATABASE_URL: `file:${sourceFile}` }, encoding: 'utf8', windowsHide: true,
  });
  assert.equal(migrated.status, 0, migrated.stderr || migrated.stdout);
  const source = new PrismaClient({ datasources: { db: { url: `file:${sourceFile}` } } });
  await source.catalogueItem.create({ data: { id: 41, sku: 'PG-FIXTURE', name: 'Migration fixture', type: 'YARN', salePrice: 0.1 + 0.2 } });
  const customer = await source.customer.create({ data: { name: 'Fixture buyer' } });
  await source.invoice.create({ data: { invoiceNo: 'INV/2627/000041', date: new Date('2026-11-04'),
    customerName: customer.name, customerId: customer.id, subtotal: 0.3, total: 0.3, cgst: 0, sgst: 0 } });
  await source.documentSequence.create({ data: { key: 'INVOICE:2026', value: 41 } });
  await source.$disconnect();
  const checksum = () => createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex');
  const before = checksum();
  const backup = path.join(directory, 'backup.db');
  fs.copyFileSync(sourceFile, backup);
  const plan = await migratePostgres({ sourceFile, targetUrl });
  assert.equal(plan.executed, false);
  const report = await migratePostgres({ sourceFile, targetUrl, execute: true, sourceStopped: true });
  assert.equal(report.executed, true);
  assert.equal(checksum(), before);
  const client = createDatabaseClient({ datasources: { db: { url: targetUrl } } });
  try {
    const item = await client.catalogueItem.findUnique({ where: { id: 41 } });
    assert.equal(item.salePrice, 0.3);
    assert.ok(item.createdAt instanceof Date);
    const next = await client.catalogueItem.create({ data: { sku: 'PG-NEXT', name: 'Next sequence', type: 'YARN' } });
    assert.equal(next.id, 42);
    const rows = await client.$queryRawUnsafe('SELECT "salePrice"::text AS amount FROM "CatalogueItem" WHERE id = 41');
    assert.equal(rows[0].amount, '0.300000');
    await assert.rejects(migratePostgres({ sourceFile, targetUrl, execute: true, sourceStopped: true }), /must be empty/);
    assert.equal(await client.catalogueItem.count(), 2);
  } finally { await client.$disconnect(); }
  const restored = new PrismaClient({ datasources: { db: { url: `file:${backup}` } } });
  try { assert.equal(await restored.catalogueItem.count(), 1); }
  finally { await restored.$disconnect(); }

  // Exercise the Nest service itself with the provider selected at construction.
  require('ts-node').register({ project: path.join(root, 'apps/api/tsconfig.json'), transpileOnly: true });
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = targetUrl;
  const { PrismaService } = require('../../apps/api/src/services/prisma.service.ts');
  const service = new PrismaService();
  try {
    await service.onModuleInit();
    assert.equal(service.getStartupIssue(), null);
    const expense = await service.stockTransaction(tx => tx.costingEntry.create({ data: {
      title: 'Exact decimal fixture', category: 'Power', totalCost: 0.1 + 0.2, date: new Date('2026-11-04'),
    } }));
    assert.equal(expense.totalCost, 0.3);
    assert.ok(await service.journalEntry.findUnique({ where: { sourceKey: `COST:${expense.id}` } }));
    const { nextInvoiceNumber } = require('../../apps/api/src/modules/commerce/document-number.ts');
    const allocated = await Promise.all(Array.from({ length: 8 }, () =>
      service.$transaction(tx => nextInvoiceNumber(tx, new Date('2026-11-04')))));
    assert.equal(new Set(allocated).size, 8);
    assert.deepEqual(allocated.slice().sort(), Array.from({ length: 8 }, (_, index) => `INV/2627/${String(index + 42).padStart(6, '0')}`));
    await assert.rejects(service.$transaction(async tx => {
      await nextInvoiceNumber(tx, new Date('2026-11-04'));
      throw new Error('failed PostgreSQL invoice posting');
    }), /failed PostgreSQL invoice posting/);
    assert.equal(await service.$transaction(tx => nextInvoiceNumber(tx, new Date('2026-11-04'))), 'INV/2627/000050');
  } finally {
    await service.onModuleDestroy();
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
  }
});
