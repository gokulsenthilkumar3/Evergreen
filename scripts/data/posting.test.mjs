import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
require('ts-node').register({ project: path.join(root, 'apps/api/tsconfig.json'), transpileOnly: true });
const { PrismaService } = require('../../apps/api/src/services/prisma.service.ts');

test('real posting scope stays bounded with history and matches the full audit after payments, void and rollback', { timeout: 90_000 }, async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'evergreen-posting-'));
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = `file:${path.join(directory, 'fixture.db')}`;
  let service;
  t.after(async () => {
    await service?.$disconnect();
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
    const resolved = fs.realpathSync(directory);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(resolved), /^evergreen-posting-/);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const migrated = spawnSync(process.execPath, [path.join(root, 'node_modules/prisma/build/index.js'),
    'migrate', 'deploy', '--schema', path.join(root, 'packages/database/prisma/schema.prisma')], {
    cwd: root, env: process.env, encoding: 'utf8', windowsHide: true,
  });
  assert.equal(migrated.status, 0, migrated.stderr || migrated.stdout);
  service = new PrismaService();
  await service.onModuleInit();
  const reads = [];
  service.$use(async (params, next) => {
    const result = await next(params);
    if (['CostingEntry', 'PayrollEntry', 'Production', 'Invoice'].includes(params.model) && params.action === 'findMany') {
      reads.push({ model: params.model, where: params.args?.where, rows: result.length });
    }
    return result;
  });
  const date = new Date('2026-11-04T10:00:00Z');
  const postCost = () => service.stockTransaction(tx => tx.costingEntry.create({ data: { date, category: 'Power', totalCost: 12.34 } }));
  await postCost();
  const baseline = [...reads];
  for (let index = 0; index < 250; index++) {
    await service.costingEntry.create({ data: { date, category: 'Historical fixture', totalCost: 1 } });
  }
  await service.auditLedgers();
  assert.equal(service.getStartupIssue(), null);
  reads.length = 0;
  const expense = await postCost();
  assert.equal(reads.length, baseline.length);
  assert.equal(reads.reduce((sum, read) => sum + read.rows, 0), 1);
  assert.deepEqual(reads.find(read => read.model === 'CostingEntry').where, { id: { in: [expense.id] } });
  t.diagnostic('Finance projection read one source row both before and after adding 250 historical cost records.');

  const customer = await service.customer.create({ data: { name: 'Posting fixture' } });
  const invoice = await service.stockTransaction(tx => tx.invoice.create({ data: {
    invoiceNo: 'INV/2627/000001', date, customerId: customer.id, customerName: customer.name,
    subtotal: 100, cgst: 2.5, sgst: 2.5, total: 105,
    payments: { create: { date, amount: 50, method: 'BANK' } },
  } }));
  assert.ok(await service.journalEntry.findUnique({ where: { sourceKey: `INVOICE:${invoice.id}` } }));
  const payment = await service.payment.findFirstOrThrow({ where: { invoiceId: invoice.id } });
  assert.ok(await service.journalEntry.findUnique({ where: { sourceKey: `PAYMENT:${payment.id}` } }));
  const entriesBeforeReplay = await service.journalEntry.count();
  await service.stockTransaction(tx => tx.invoice.findUnique({ where: { id: invoice.id } }));
  assert.equal(await service.journalEntry.count(), entriesBeforeReplay);
  await service.stockTransaction(async tx => {
    await tx.payment.create({ data: { invoiceId: invoice.id, date, amount: -50, method: 'BANK' } });
    await tx.invoice.update({ where: { id: invoice.id }, data: { status: 'VOID' } });
  });
  const snapshot = () => service.journalEntry.findMany({ orderBy: { sourceKey: 'asc' }, include: { lines: { orderBy: { id: 'asc' } } } });
  const incremental = await snapshot();
  await service.auditLedgers();
  assert.deepEqual(await snapshot(), incremental);
  for (const entry of incremental) {
    const balance = entry.lines.reduce((sum, line) => sum + line.debit - line.credit, 0);
    assert.ok(Math.abs(balance) < 0.000001, entry.sourceKey);
  }

  const count = await service.costingEntry.count();
  await assert.rejects(service.stockTransaction(async tx => {
    await tx.costingEntry.create({ data: { date, category: 'Rollback fixture', totalCost: 15 } });
    throw new Error('rollback fixture');
  }), /rollback fixture/);
  assert.equal(await service.costingEntry.count(), count);
  await service.accountingPeriod.create({ data: { through: new Date('2026-11-03T23:59:59Z'), closedBy: 'FIXTURE', reason: 'Test closed history' } });
  await assert.rejects(service.stockTransaction(tx => tx.invoice.update({ where: { id: invoice.id }, data: { date: new Date('2026-11-01T10:00:00Z') } })), /Books are closed/);
  assert.equal((await service.invoice.findUniqueOrThrow({ where: { id: invoice.id } })).date.getTime(), date.getTime());
});
