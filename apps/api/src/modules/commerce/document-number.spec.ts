import { PrismaClient } from '@prisma/client';
import { mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { invoiceSeries, nextInvoiceNumber } from './document-number';

describe('transactional invoice series', () => {
  let directory: string;
  let client: PrismaClient;
  const date = new Date('2026-11-04T10:00:00Z');
  beforeEach(async () => {
    directory = mkdtempSync(path.join(tmpdir(), 'evergreen-numbering-'));
    client = new PrismaClient({ datasources: { db: { url: `file:${path.join(directory, 'fixture.db')}` } } });
    await client.$executeRawUnsafe('CREATE TABLE "DocumentSequence" ("key" TEXT PRIMARY KEY NOT NULL, "value" INTEGER NOT NULL)');
    await client.$executeRawUnsafe('CREATE TABLE "Invoice" ("id" INTEGER PRIMARY KEY, "invoiceNo" TEXT NOT NULL UNIQUE)');
  });
  afterEach(async () => {
    await client.$disconnect();
    const resolved = realpathSync(directory);
    expect(path.dirname(resolved)).toBe(realpathSync(tmpdir()));
    expect(path.basename(resolved)).toMatch(/^evergreen-numbering-/);
    rmSync(resolved, { recursive: true, force: true });
  });
  it('resets at the Indian financial-year boundary, including an IST midnight timestamp', () => {
    expect(invoiceSeries(new Date('2026-03-31T18:29:59Z'))).toBe('INV/2526/');
    expect(invoiceSeries(new Date('2026-03-31T18:30:00Z'))).toBe('INV/2627/');
    expect(() => invoiceSeries(new Date('invalid'))).toThrow('Invalid invoice date');
  });
  it('allocates consecutive bounded numbers and rolls back a failed posting', async () => {
    expect(await client.$transaction(tx => nextInvoiceNumber(tx, date))).toBe('INV/2627/000001');
    await expect(client.$transaction(async tx => {
      expect(await nextInvoiceNumber(tx, date)).toBe('INV/2627/000002');
      throw new Error('posting failed');
    })).rejects.toThrow('posting failed');
    const number = await client.$transaction(tx => nextInvoiceNumber(tx, date));
    expect(number).toBe('INV/2627/000002');
    expect(number.length).toBeLessThanOrEqual(16);
  });
  it('adopts an existing series and refuses exhaustion without consuming the counter', async () => {
    await client.$executeRaw`INSERT INTO "Invoice" ("invoiceNo") VALUES (${'INV/2627/000041'})`;
    expect(await client.$transaction(tx => nextInvoiceNumber(tx, date))).toBe('INV/2627/000042');
    await client.documentSequence.update({ where: { key: 'INVOICE:2026' }, data: { value: 999_999 } });
    await expect(client.$transaction(tx => nextInvoiceNumber(tx, date))).rejects.toThrow('exhausted');
    expect((await client.documentSequence.findUnique({ where: { key: 'INVOICE:2026' } }))?.value).toBe(999_999);
  });
});
