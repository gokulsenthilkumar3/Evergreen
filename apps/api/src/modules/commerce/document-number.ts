import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

/** Indian financial year, evaluated in IST even for timestamps close to midnight. */
export function invoiceFinancialYear(date: Date): number {
  if (!Number.isFinite(date.getTime())) throw new BadRequestException('Invalid invoice date');
  const local = new Date(date.getTime() + 330 * 60_000);
  return local.getUTCFullYear() - (local.getUTCMonth() < 3 ? 1 : 0);
}
export function invoiceSeries(date: Date): string {
  const start = invoiceFinancialYear(date);
  return `INV/${String(start).slice(-2)}${String(start + 1).slice(-2)}/`;
}

/** Must be called inside the invoice posting transaction, after request-key replay checks. */
export async function nextInvoiceNumber(tx: Prisma.TransactionClient, date: Date): Promise<string> {
  const prefix = invoiceSeries(date);
  const key = `INVOICE:${invoiceFinancialYear(date)}`;
  const current = await tx.documentSequence.findUnique({ where: { key } });
  let first = 1;
  if (!current) {
    // Safely adopt an existing series. Fixed-width numbers sort in sequence order.
    const existing = await tx.invoice.findMany({
      where: { invoiceNo: { startsWith: prefix } }, select: { invoiceNo: true },
    });
    for (const row of existing) {
      const suffix = row.invoiceNo.slice(prefix.length);
      if (/^\d{6}$/.test(suffix)) first = Math.max(first, Number(suffix) + 1);
    }
  }
  const counter = await tx.documentSequence.upsert({
    where: { key }, create: { key, value: first }, update: { value: { increment: 1 } },
  });
  if (counter.value > 999_999) throw new BadRequestException('Invoice series exhausted; configure a new series before posting');
  return prefix + String(counter.value).padStart(6, '0');
}
