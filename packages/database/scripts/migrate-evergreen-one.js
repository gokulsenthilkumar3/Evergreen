/*
 * EverGreen One legacy bridge.
 * Run only after `prisma db push` has added the unified commerce tables.
 * It is idempotent: legacySource/legacyId guard each ledger import.
 */
const { PrismaClient } = require('@prisma/client');
const { copyFileSync, existsSync, mkdirSync } = require('fs');
const { join, resolve } = require('path');

const prisma = new PrismaClient();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const databasePath = resolve(__dirname, '..', 'prisma', 'dev.db');
const backupDir = resolve(__dirname, '..', 'prisma', 'backups');

async function itemFor({ sku, name, type, uom = 'KG' }) {
  return prisma.catalogueItem.upsert({ where: { sku }, update: {}, create: { sku, name, type, uom, legacySource: 'EVERGREEN_LEGACY' } });
}

async function addMovement(data) {
  const exists = await prisma.stockMovement.findFirst({ where: { legacySource: data.legacySource, referenceId: data.referenceId } });
  if (!exists) await prisma.stockMovement.create({ data });
}

async function main() {
  if (!existsSync(databasePath)) throw new Error(`Database not found: ${databasePath}`);
  mkdirSync(backupDir, { recursive: true });
  const backup = join(backupDir, `dev-before-evergreen-one-${stamp}.db`);
  copyFileSync(databasePath, backup);
  console.log(`Backup created: ${backup}`);

  const [cotton, yarn, legacyInvoices] = await Promise.all([
    prisma.cottonInventory.findMany({ orderBy: { id: 'asc' } }),
    prisma.yarnInventory.findMany({ orderBy: { id: 'asc' } }),
    prisma.invoice.findMany({ include: { payments: true }, orderBy: { id: 'asc' } }),
  ]);

  for (const entry of cotton) {
    const batchKey = entry.batchId || entry.reference || entry.type;
    const item = await itemFor({ sku: `LEGACY-COTTON-${batchKey}`, name: `Cotton batch ${batchKey}`, type: 'RAW_MATERIAL' });
    await addMovement({ itemId: item.id, date: entry.date, quantity: entry.quantity, movementType: entry.type, referenceType: 'LEGACY_COTTON', referenceId: String(entry.id), legacySource: 'EVERGREEN_COTTON', notes: entry.reference });
  }
  for (const entry of yarn) {
    const count = entry.count || entry.type;
    const item = await itemFor({ sku: `LEGACY-YARN-${count}`, name: `Yarn ${count}`, type: 'YARN' });
    await addMovement({ itemId: item.id, date: entry.date, quantity: entry.quantity, movementType: entry.type, referenceType: 'LEGACY_YARN', referenceId: String(entry.id), legacySource: 'EVERGREEN_YARN', notes: entry.reference });
  }
  for (const legacy of legacyInvoices) {
    const existingCustomer = await prisma.customer.findFirst({ where: { name: legacy.customerName } });
    const customer = existingCustomer || await prisma.customer.create({ data: { name: legacy.customerName, gstin: legacy.customerGSTIN || null, address: legacy.customerAddress || null, state: legacy.buyerState || 'Tamil Nadu' } });
    if (!legacy.customerId) await prisma.invoice.update({ where: { id: legacy.id }, data: { customerId: customer.id } });
    const ledgerExists = await prisma.customerLedgerEntry.findFirst({ where: { customerId: customer.id, reference: legacy.invoiceNo, type: 'INVOICE' } });
    if (!ledgerExists) await prisma.customerLedgerEntry.create({ data: { customerId: customer.id, date: legacy.date, type: 'INVOICE', debit: legacy.total, reference: legacy.invoiceNo, notes: 'Migrated EverGreen invoice' } });
    for (const payment of legacy.payments) {
      const paymentExists = await prisma.customerLedgerEntry.findFirst({ where: { customerId: customer.id, reference: `${legacy.invoiceNo}:PAY:${payment.id}` } });
      if (!paymentExists) await prisma.customerLedgerEntry.create({ data: { customerId: customer.id, date: payment.date, type: 'PAYMENT', credit: payment.amount, reference: `${legacy.invoiceNo}:PAY:${payment.id}`, notes: 'Migrated EverGreen payment' } });
    }
  }
  console.log(`Migrated ${cotton.length} cotton movements, ${yarn.length} yarn movements and ${legacyInvoices.length} invoices.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
